import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PopulateOutput {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  dueDate?: string;
  expiryDate?: string;
  terms?: string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
  }>;
}

/**
 * Intelligent Rule-based parsing fallback when no LLM API key is configured
 */
function heuristicParse(prompt: string, documentType: string, currency: string = "KES"): PopulateOutput {
  const text = prompt;
  
  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const customerEmail = emailMatch ? emailMatch[0] : "";

  // Extract phone (e.g. 0712345678, +254..., etc.)
  const phoneMatch = text.match(/(\+?\d{1,4}[ -]?)?0?[71]\d{8}/);
  const customerPhone = phoneMatch ? phoneMatch[0].replace(/[\s-]/g, "") : "";

  // Extract customer name (e.g. "for John Doe", "Client: ABC Ltd", "to Jane")
  let customerName = "";
  const nameMatch = text.match(/(?:for|client|to|customer|named|attn:?)\s+([A-Z][a-zA-Z0-9\s.&'-]{2,25})/i);
  if (nameMatch) {
    customerName = nameMatch[1].trim();
  }

  // Parse potential line items
  // Look for patterns like "3 laptops at $500", "5 boxes @ 250", "installation fee 1500"
  const items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
  }> = [];

  const lines = text.split(/[\n,;]|(?:\band\b)/i).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const qtyPriceMatch = line.match(/(\d+)\s*(?:x|\*|pcs|units|items)?\s+([a-zA-Z0-9\s_-]+?)\s*(?:at|@|for|costing)?\s*[\$£€KESkes]*\s*([\d,]+(?:\.\d+)?)/i);
    if (qtyPriceMatch) {
      const qty = parseInt(qtyPriceMatch[1], 10) || 1;
      const desc = qtyPriceMatch[2].trim();
      const price = parseFloat(qtyPriceMatch[3].replace(/,/g, "")) || 0;
      if (desc && price > 0) {
        items.push({
          description: desc.charAt(0).toUpperCase() + desc.slice(1),
          quantity: qty,
          unitPrice: price,
          taxRate: 16,
          discount: 0,
        });
      }
    } else {
      // Check for simple item with price "installation 5000"
      const simpleMatch = line.match(/([a-zA-Z\s_-]{3,35})\s*[\$£€KESkes]*\s*([\d,]+(?:\.\d+)?)/i);
      if (simpleMatch && !simpleMatch[1].toLowerCase().includes("phone") && !simpleMatch[1].toLowerCase().includes("total")) {
        const desc = simpleMatch[1].trim();
        const price = parseFloat(simpleMatch[2].replace(/,/g, "")) || 0;
        if (price > 10) {
          items.push({
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
            quantity: 1,
            unitPrice: price,
            taxRate: 16,
            discount: 0,
          });
        }
      }
    }
  }

  // Default item if none matched
  if (items.length === 0) {
    items.push({
      description: prompt.slice(0, 45).trim() || "Consulting & Professional Services",
      quantity: 1,
      unitPrice: 1000,
      taxRate: 16,
      discount: 0,
    });
  }

  const defaultDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return {
    customerName: customerName || undefined,
    customerEmail: customerEmail || undefined,
    customerPhone: customerPhone || undefined,
    dueDate: defaultDue,
    expiryDate: defaultDue,
    terms: documentType === "QUOTATION"
      ? "Quotation valid for 30 days. 50% mobilization deposit required on acceptance."
      : "Payment due within 30 days of invoice date.",
    notes: `Generated via SalesmanPro AI Document Assistant for: "${prompt.slice(0, 60)}..."`,
    items,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    const body = await req.json();
    const { prompt, documentType = "INVOICE", currency = "KES", companyId } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ success: false, error: "Please enter a description or note for the AI to process." }, { status: 400 });
    }

    const geminiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // Try Gemini API first if configured
    if (geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const systemPrompt = `You are an expert commercial accountant and sales operations manager for SalesmanPro.
Given a user's rough prompt, voice note, or instructions for a ${documentType}, extract and synthesize structured commercial document details.
Default currency is ${currency}.
Always return a valid JSON object matching this schema:
{
  "customerName": "Client or Customer Full Name or Company Name",
  "customerEmail": "Email address if mentioned or empty string",
  "customerPhone": "Phone number if mentioned or empty string",
  "dueDate": "YYYY-MM-DD (estimate realistic date like +30 days if not stated)",
  "expiryDate": "YYYY-MM-DD (for quotation validity)",
  "terms": "Appropriate commercial terms and conditions",
  "notes": "Professional payment or delivery instructions",
  "items": [
    {
      "description": "Clear professional line item title",
      "quantity": 1,
      "unitPrice": 100.0,
      "taxRate": 16.0,
      "discount": 0.0
    }
  ]
}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (res.ok) {
          const jsonRes = await res.json();
          const rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as PopulateOutput;
            if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
              return NextResponse.json({
                success: true,
                message: "Document details synthesized with Gemini AI",
                data: parsed,
                source: "GEMINI_AI",
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn("[Gemini API Attempt Failed, falling back to OpenAI/heuristic]", geminiErr);
      }
    }

    // Try OpenAI API if configured
    if (openAiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are a sales document generator for SalesmanPro. Return a JSON object with: customerName, customerEmail, customerPhone, dueDate (YYYY-MM-DD), terms, notes, and items (array of { description, quantity, unitPrice, taxRate, discount }). Currency: ${currency}.`,
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const jsonRes = await res.json();
          const raw = jsonRes.choices?.[0]?.message?.content;
          if (raw) {
            const parsed = JSON.parse(raw);
            return NextResponse.json({
              success: true,
              message: "Document details synthesized with OpenAI",
              data: parsed,
              source: "OPENAI",
            });
          }
        }
      } catch (openAiErr) {
        console.warn("[OpenAI Attempt Failed, falling back to heuristic]", openAiErr);
      }
    }

    // Fallback: Smart Heuristic Extractor
    const fallbackData = heuristicParse(prompt, documentType, currency);
    return NextResponse.json({
      success: true,
      message: "Document details parsed via Smart Document Parser",
      data: fallbackData,
      source: "SMART_HEURISTIC",
    });
  } catch (error: any) {
    console.error("AI populate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to synthesize document details" },
      { status: 500 }
    );
  }
}
