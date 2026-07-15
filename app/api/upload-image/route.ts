import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/firebase";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // ✅ STEP 1: AUTHENTICATION CHECK
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid user" }, { status: 401 });
    }

    // ✅ STEP 2: FILE SIZE CHECK (Max 5MB)
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) { // 5MB limit
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // ✅ STEP 3: FILE TYPE VALIDATION
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WebP allowed." }, { status: 400 });
    }

    // ✅ STEP 4: UPLOAD TO CLOUDINARY (Image only)
    const b64 = Buffer.from(buffer).toString("base64");
    const dataURI = "data:" + file.type + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "image", // ✅ Only images allowed
      folder: "alcazo_uploads",
      transformation: [
        { max_width: 2048, max_height: 2048 }, // Resize large images
        { quality: "auto" }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}