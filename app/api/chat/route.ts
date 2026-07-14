import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in .env.local" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ✅ FIXED: 'gemini-flash-latest' use kar rahe hain. 
    // Ye hamesha free tier mein available rehta hai aur iska quota 0 nahi hota!
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    const prompt = `You are Alcazo Assistant for a home service app. Keep answers VERY short (2-3 lines max). Use simple English or Hindi. Provide numbered steps.\n\nUser: ${lastUserMessage}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });

  } catch (error: any) {
    console.error("❌ AI API CRASHED:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}