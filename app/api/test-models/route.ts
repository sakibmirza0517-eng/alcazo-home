import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // ✅ Direct REST API call (SDK version se independent, 100% reliable)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: data.error?.message || "Failed to fetch models",
        hint: "Google Cloud Console mein jaakar 'Generative Language API' enable karo."
      }, { status: response.status });
    }

    // Sirf un models ko filter karo jo 'generateContent' support karte hain
    const availableModels = data.models
      .filter((model: any) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model: any) => model.name);

    return NextResponse.json({ 
      success: true,
      message: "API Key is 100% Valid! Ye models tum use kar sakte ho:",
      models: availableModels
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}