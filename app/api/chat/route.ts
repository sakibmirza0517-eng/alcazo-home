import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1].content;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          // 🧠 YAHAN TU APNA CUSTOM "TRAINING" PROMPT LIKH SAKTA HAI!
          content: `You are "Alcazo Assistant", an AI helper for a home services app (like plumbing, carpentry, cleaning). 
          
          STRICT RULES:
          1. Keep answers VERY short (2-3 lines maximum).
          2. Use simple Hinglish (Hindi + English mix) or simple English.
          3. If asked about booking, say: "Go to the 'Book Service' page, choose your service, and select a professional."
          4. If asked about pricing, say: "Prices depend on the service and professional. You can see exact prices on the booking page."
          5. Always be polite, helpful, and use numbered steps if explaining a process.
          6. Do NOT make up fake phone numbers or addresses. Direct them to the app's contact or booking section.`
        },
        {
          role: "user",
          content: lastUserMessage
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.error("❌ AI API CRASHED:", error.message);
    return NextResponse.json({ 
      error: "AI is currently busy. Please try again in a moment." 
    }, { status: 503 });
  }
}