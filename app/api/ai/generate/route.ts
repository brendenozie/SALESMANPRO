import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * API Route for AI-powered content generation for SALESMANPRO stores.
 * This route connects to OpenAI (or your preferred LLM) to generate
 * marketing copy, SEO metadata, and FAQs based on user input.
 */

export async function POST(req: Request) {
  try {
    // 1. Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, category, section, currentDescription } = await req.json();

    if (!name || !category) {
      return NextResponse.json(
        { error: "Business name and category are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured on the server." },
        { status: 500 }
      );
    }

    // 2. Construct the prompt based on the requested section
    let prompt = "";
    if (section === "basic") {
      prompt = `Generate a catchy tagline and a compelling 2-3 paragraph business description for a store named "${name}" in the "${category}" category. 
      Return the response as a JSON object with keys "tagline" and "description".`;
    } else if (section === "seo") {
      prompt = `Generate SEO metadata for a store named "${name}" in the "${category}" category. 
      Use this description as context: "${currentDescription || ""}". 
      Return a JSON object with keys "title" (max 60 chars), "description" (max 160 chars), and "keywords" (an array of 10 relevant keywords).`;
    } else if (section === "faqs") {
      prompt = `Generate 5 frequently asked questions and answers for a store named "${name}" in the "${category}" category. 
      Return a JSON array of objects, each with "question" and "answer" keys.`;
    } else if (section === "pricing") {
      prompt = `Generate 3 professional pricing tiers for a store named "${name}" in the "${category}" category. 
      Return a JSON object with a "pricingTiers" key containing an array of 3 objects.
      Each object should have: "name" (e.g., Basic, Pro), "price" (number), "description" (short string), "duration" (monthly/yearly), and "features" (array of 4-5 strings).`;
    } else if (section === "marketing") {
      prompt = `Generate 3 compelling hero slides and 2 promotional offers for a store named "${name}" in the "${category}" category.
      Return a JSON object with two keys: 
      1. "heroSlides": array of objects with "headline", "subline", "ctaText", "badgeText".
      2. "promotions": array of objects with "title", "description", "ctaText", "code" (e.g. WELCOME10).`;
    }

    // 3. Call OpenAI API
    const textresponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective and fast
        messages: [
          {
            role: "system",
            content: "You are a professional marketing and SEO assistant for a business platform called SALESMANPRO. You help users create high-quality content for their online stores. Always return valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    
    const textData = await textresponse.json();
    const content = JSON.parse(textData.choices[0].message.content);

    // 2. NEW: Generate Images for Hero Slides using DALL-E
    if (section === "marketing" && content.heroSlides) {
      const imagePromises = content.heroSlides.map(async (slide: any) => {
        const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: `A professional, high-resolution, minimalistic background image for a ${category} store website called "${name}". The image should be suitable for a hero banner with the headline: "${slide.headline}". Cinematic lighting, 16:9 aspect ratio, no text in the image.`,
            n: 1,
            size: "1024x1024", // DALL-E 3 defaults to high quality
          }),
        });
        const imageData = await imageRes.json();
        return imageData.data[0].url;
      });

      const imageUrls = await Promise.all(imagePromises);
      
      // Attach images to the slides
      content.heroSlides = content.heroSlides.map((slide: any, i: number) => ({
        ...slide,
        imageUrl: imageUrls[i]
      }));
    }

    // if (!response.ok) {
    //   throw new Error(aiData.error?.message || "AI Generation failed");
    // }

    // const content = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json(content);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}