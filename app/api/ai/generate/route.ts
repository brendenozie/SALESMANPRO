// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, category, section, currentDescription } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "AI key not set" }, { status: 500 });
    }

    // Sanitize user inputs to prevent prompt injection
    const sanitizedName = (name || "").slice(0, 100).replace(/[<>]/g, "");
    const sanitizedCategory = (category || "").slice(0, 100).replace(/[<>]/g, "");

    let prompt = "";
    if (section === "basic") {
      prompt = `Generate a tagline and description for "${sanitizedName}" in "${sanitizedCategory}". Return JSON with "tagline" and "description".`;
    } else if (section === "seo") {
      prompt = `Generate SEO title, description, and keywords for "${sanitizedName}" in "${sanitizedCategory}". Return JSON with "title", "description", and "keywords" (array of strings).`;
    } else if (section === "pricing") {
      prompt = `Generate 3 pricing tiers (Basic, Pro, Enterprise) for "${sanitizedName}" in "${sanitizedCategory}". Return JSON with "pricingTiers" array containing objects with: name, price (number), features (array of strings), description, duration (e.g., "monthly").`;
    } else if (section === "marketing") {
      prompt = `Generate 2 hero slides (headline, subline, ctaText) and 2 promotions for "${sanitizedName}" in "${sanitizedCategory}". Return JSON with "heroSlides" array (objects with headline, subline, ctaText strings) and "promotions" array (objects with title, description strings).`;
    } else if (section === "faqs") {
      prompt = `Generate 5 FAQs for "${sanitizedName}" in "${sanitizedCategory}". Return JSON with "faqs" array containing objects with "question" and "answer" strings.`;
    } else {
      return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!textResponse.ok) {
      const errorData = await textResponse.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API error" },
        { status: textResponse.status }
      );
    }

    const textData = await textResponse.json();
    
    if (!textData.choices || textData.choices.length === 0) {
      return NextResponse.json(
        { error: "Invalid response from OpenAI" },
        { status: 500 }
      );
    }
    
    const content = JSON.parse(textData.choices[0].message.content);

    // DALL-E integration for marketing section
    if (section === "marketing" && content.heroSlides && content.heroSlides.length > 0) {
      try {
        const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `Professional hero banner for a ${sanitizedCategory} store called "${sanitizedName}". Modern, clean, professional style.`,
            n: 1,
            size: "1024x1024",
          }),
        });

        if (imageRes.ok) {
          const imageData = await imageRes.json();
          content.heroSlides[0].imageUrl = imageData.data[0].url;
        } else {
          console.warn("DALL-E image generation failed, continuing without image");
        }
      } catch (imageError) {
        console.warn("DALL-E image generation error:", imageError);
        // Continue without the image
      }
    }

    return NextResponse.json(content);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("AI generation error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
