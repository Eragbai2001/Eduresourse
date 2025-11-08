import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomUUID, createHmac } from "crypto";
import { createServerClient } from "@supabase/ssr";
import nodemailer from "nodemailer";

// Helper to generate signed rating token
function generateRatingToken(userId: string, resourceId: string): string {
  const secret =
    process.env.RATING_TOKEN_SECRET || "default-secret-change-in-production";
  const timestamp = Date.now().toString();
  const data = `${userId}:${resourceId}:${timestamp}`;
  const signature = createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(`${data}:${signature}`).toString("base64url");
}

// Helper to send rating request email
async function sendRatingEmail(
  to: string,
  userName: string,
  courseTitle: string,
  resourceId: string,
  userId: string
) {
  console.log("📨 sendRatingEmail called for:", to);
  console.log("📋 Environment check:", {
    FROM_EMAIL: process.env.FROM_EMAIL ? "✅ Set" : "❌ Missing",
    SMTP_HOST: process.env.SMTP_HOST ? "✅ Set" : "❌ Missing",
    SMTP_USER: process.env.SMTP_USER ? "✅ Set" : "❌ Missing",
    SMTP_PASS: process.env.SMTP_PASS ? "✅ Set" : "❌ Missing",
    RATING_TOKEN_SECRET: process.env.RATING_TOKEN_SECRET ? "✅ Set" : "❌ Missing",
  });

  const from = process.env.FROM_EMAIL;
  if (!from) {
    console.warn("❌ FROM_EMAIL not configured; skipping rating email to", to);
    return false;
  }

  const token = generateRatingToken(userId, resourceId);
  const ratingUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  }/rate/${resourceId}?token=${token}`;

  // Try SMTP first (Nodemailer)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      console.log("🔧 Attempting SMTP email send to:", to);
      console.log("📧 SMTP Config:", {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: from,
      });

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: false, // Use TLS for port 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f8ff; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2E3135; margin-bottom: 20px;">Thanks for downloading "${courseTitle}"!</h2>
              <p style="color: #797B7E; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
              <p style="color: #797B7E; font-size: 16px; line-height: 1.6;">We hope you're enjoying the course. Your feedback helps other students make better decisions!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ratingUrl}" style="display: inline-block; background-color: #FFB0E8; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Rate This Course</a>
              </div>
              <p style="color: #8D8F91; font-size: 14px; text-align: center; margin-top: 30px;">Or copy this link: <a href="${ratingUrl}" style="color: #9FB9EB;">${ratingUrl}</a></p>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from,
        to,
        subject: `How was "${courseTitle}"? Share your feedback`,
        html,
      });

      console.log("✅ Rating email sent via SMTP to:", to);
      return true;
    } catch (err) {
      console.error("❌ SMTP send failed:", err);
      console.error("Full error details:", JSON.stringify(err, null, 2));
    }
  }

  // Fallback to SendGrid
  const key = process.env.SENDGRID_API_KEY;
  if (key) {
    try {
      const html = `
        <h2>Thanks for downloading "${courseTitle}"!</h2>
        <p>Hi ${userName},</p>
        <p>We hope you're enjoying the course. Your feedback helps other students!</p>
        <p><a href="${ratingUrl}" style="display: inline-block; background-color: #FFB0E8; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Rate This Course</a></p>
      `;

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject: `How was "${courseTitle}"? Share your feedback`,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (res.ok) {
        console.log("✅ Rating email sent via SendGrid to:", to);
        return true;
      }
    } catch (err) {
      console.error("SendGrid send failed:", err);
    }
  }

  console.warn("No SMTP or SendGrid configured; skipping rating email");
  return false;
}

// Helper to extract resource id from pathname
function extractResourceId(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const resourcesIndex = parts.findIndex((p) => p === "resources");
  return resourcesIndex !== -1 ? parts[resourcesIndex + 1] : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? new URL(req.url).pathname;
    const id = extractResourceId(pathname);

    if (!id) {
      return NextResponse.json(
        { error: "Missing resource id" },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const debugEnabled =
      url.searchParams.get("debug") === "1" ||
      req.headers.get("x-debug") === "1";
    const debug: Record<string, unknown> = {};

    // Read body early so we can fallback to client-provided userId if needed
    const body = (await req.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (debugEnabled) debug.requestBody = body;

    // Derive authenticated user via Supabase server client (cookies or Authorization Bearer)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {
            // no-op for API routes
            return;
          },
        },
      }
    );

    // Try to get authenticated user, but do not require it for incrementing download counts.
    let userId: string | undefined = undefined;
    try {
      const resp = await supabase.auth.getUser();
      userId = resp.data?.user?.id;
    } catch {
      // no authenticated user available; continue without failing
      userId = undefined;
    }
    // Fallback: if no session-derived userId, trust client-sent body as a last resort
    if (!userId && body && typeof body.userId === "string") {
      userId = body.userId as string;
      if (debugEnabled) debug.userIdSource = "body";
    } else if (userId && debugEnabled) {
      debug.userIdSource = "session";
    }

    // Increment download count
    const updated = await prisma.resource.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });
    if (debugEnabled) debug.updatedDownloadCount = updated.downloadCount;

    // Send rating email immediately if requested and user is available
    const sendRatingEmailFlag = body && body.sendRatingEmail === true;
    if (userId && sendRatingEmailFlag) {
      // Check if this is the first download for this user/resource combination
      const existingDownload = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count
         FROM public.download_reminders
         WHERE user_id = '${userId}' AND resource_id = '${id}'`
      );

      const isFirstDownload = Number(existingDownload[0]?.count || 0) === 0;

      if (isFirstDownload) {
        // Get user profile and course title for email
        try {
          const [profile, resource] = await Promise.all([
            prisma.$queryRawUnsafe<
              Array<{
                email: string;
                full_name?: string;
                display_name?: string;
              }>
            >(
              `SELECT email, full_name, display_name
               FROM public.profiles
               WHERE user_id = CAST('${userId}' AS uuid)
               LIMIT 1`
            ),
            prisma.resource.findUnique({
              where: { id },
              select: { title: true },
            }),
          ]);

          if (profile[0]?.email && resource?.title) {
            const userName =
              profile[0].full_name || profile[0].display_name || "there";

            console.log("🚀 About to send rating email:", {
              to: profile[0].email,
              userName,
              courseTitle: resource.title,
              resourceId: id,
              userId,
            });

            // Send email in background (don't wait)
            sendRatingEmail(
              profile[0].email,
              userName,
              resource.title,
              id,
              userId
            ).catch((err) =>
              console.error("❌ Failed to send rating email:", err)
            );

            // Track that we sent the email
            const now = new Date();
            const reminderId = randomUUID();
            await prisma.$executeRawUnsafe(
              `INSERT INTO public.download_reminders (id, user_id, resource_id, first_downloaded_at, reminder_scheduled_at, reminder_sent_at, status, created_at)
               VALUES ('${reminderId}', '${userId}', '${id}', '${now.toISOString()}', '${now.toISOString()}', '${now.toISOString()}', 'sent', '${now.toISOString()}')
               ON CONFLICT (user_id, resource_id) DO NOTHING`
            );

            if (debugEnabled) {
              debug.emailSent = true;
              debug.sentTo = profile[0].email;
            }

            console.log(
              `✅ Rating email sent immediately to ${profile[0].email} for resource ${id}`
            );
          }
        } catch (emailErr) {
          console.error("Error sending rating email:", emailErr);
          // Don't fail the download increment if email fails
        }
      } else if (debugEnabled) {
        debug.emailSent = false;
        debug.reason = "User has already downloaded this resource";
      }
    }

    const responseBody: Record<string, unknown> = { success: true };
    if (debugEnabled) responseBody.debug = debug;
    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("increment-download error:", err);
    return NextResponse.json(
      { error: "Failed to increment download count" },
      { status: 500 }
    );
  }
}
