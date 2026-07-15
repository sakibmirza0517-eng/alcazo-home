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
          // 🧠 ADVANCED TRAINING PROMPT: AI ko Alcazo ka exact expert bana diya hai
          content: `You are "Alcazo Assistant", the official AI support for Alcazo - a trusted home services platform based in Karnal, Haryana.

          ABOUT ALCAZO:
          - We connect customers with verified local professionals (Carpenters, Plumbers, Electricians, Painters, AC Technicians, etc.).
          - Services include: Expert home services, furniture repair, pest control, tile & flooring, and interior design.
          
          STRICT RULES FOR ANSWERS:
          1. Keep answers VERY short (2-3 lines maximum).
          2. Use simple Hinglish (Hindi + English mix) or simple English.
          3. If asked about booking: "Go to the 'Book Service' page, choose your service, and select a verified professional."
          4. If asked about pricing: "Prices depend on the service. You can see exact quotes on the booking page before confirming."
          5. If asked about verification: "All our professionals are ID-verified, skilled, and background-checked."
          6. If asked about location: "We currently serve Karnal, Haryana and nearby areas."
          7. Contact Info: If they need direct help, tell them to call 9050951046 or email sakibfatih107@gmail.com.
          8. ZERO HALLUCINATION: NEVER make up fake prices, fake addresses, or fake phone numbers. Always guide them to the app's features or official contact.
          9. Be polite, helpful, and use numbered steps if explaining a process.`
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