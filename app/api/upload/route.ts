import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64String = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64String}`;

    // Check if Cloudinary credentials are configured
    const isCloudinaryConfigured =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.includes("your_cloud_name");

    if (isCloudinaryConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(dataUrl, {
          folder: "splendo-menu",
          resource_type: "auto",
        });
        return NextResponse.json({ url: uploadResult.secure_url });
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload failed:", cloudinaryError?.message || cloudinaryError);
        // Fallback: return data URL if Cloudinary upload fails (e.g., HTTP 403 invalid credentials)
        return NextResponse.json({
          url: dataUrl,
          warning: `Cloudinary error: ${cloudinaryError?.message || "Upload failed"}. Used data URL fallback.`,
        });
      }
    } else {
      // Fallback: return data URL if Cloudinary is not configured yet
      return NextResponse.json({
        url: dataUrl,
        warning: "Cloudinary credentials not set in .env.local; using data URL fallback.",
      });
    }
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
