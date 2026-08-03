import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase/server";

/**
 * Upload endpoint for thumbnails and media.
 *
 * Storage target is swappable: set the five R2_* variables and uploads go to
 * Cloudflare R2; leave them blank and they go to the Supabase `media` bucket.
 * Either way the admin UI only ever sees a URL back.
 *
 * The write is performed with the caller's own session, so `is_admin()` decides
 * whether it is allowed — the service role key is never used here.
 */

export const runtime = "nodejs";

const r2Configured = () =>
  Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL,
  );

export async function POST(request: Request) {
  const supabase = await sessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return NextResponse.json({ error: "Not an admin." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  }
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File is larger than 50 MB." }, { status: 400 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;

  if (r2Configured()) {
    // Imported lazily so the dependency is only needed when R2 is actually used.
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || "application/octet-stream",
      }),
    );
    const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
    return NextResponse.json({ url: `${base}/${key}`, storage: "r2" });
  }

  const bucket = process.env.MEDIA_BUCKET || "media";
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, file, { contentType: file.type || undefined, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return NextResponse.json({ url: data.publicUrl, storage: "supabase" });
}
