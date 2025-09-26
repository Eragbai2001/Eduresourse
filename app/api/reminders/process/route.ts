import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import nodemailer from "nodemailer";

// Unified email helper: prefer SMTP (Nodemailer) when configured, otherwise fallback to SendGrid.
async function sendEmail(to: string, subject: string, html: string) {
  const from = process.env.FROM_EMAIL;
  if (!from) {
    console.warn("FROM_EMAIL not configured; skipping email to", to);
    return false;
  }

  // If SMTP is configured, use Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = process.env.SMTP_PORT
        ? Number(process.env.SMTP_PORT)
        : undefined;
      const secure = (process.env.SMTP_SECURE || "").toLowerCase() === "true";
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: !!secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.info("Email sent via SMTP", info.messageId ?? info);
      return true;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("SMTP send failed:", errMsg);
      // fall through to try SendGrid if configured
    }
  }

  // Fallback: SendGrid if available
  const key = process.env.SENDGRID_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });
      return res.ok;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("SendGrid send failed:", errMsg);
      return false;
    }
  }

  console.warn("No SMTP or SendGrid configured; skipping email to", to);
  return false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
  try {
    const now = new Date();

    // Find reminders that are scheduled and due
    const due = await prisma.$queryRaw`
      SELECT dr.id, dr.user_id, dr.resource_id, dr.first_downloaded_at, p.email, r.title
      FROM public.download_reminders dr
      JOIN public.profiles p ON p.user_id = dr.user_id
      LEFT JOIN public.resources r ON r.id = dr.resource_id
      WHERE dr.status = 'scheduled' AND dr.reminder_scheduled_at <= ${now}
      LIMIT 100
    `;

    // Try to read the local logo for embedding as a data URI (optional, falls back if missing)
    let logoDataUri = "";
    try {
      const logoPath = join(process.cwd(), "public", "logo.png");
      const buf = await readFile(logoPath);
      logoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
    } catch (caught) {
      // Not fatal — continue without embedded logo. Normalize error to string safely.
      const errMsg = caught instanceof Error ? caught.message : String(caught);
      console.warn(
        "logo.png for emails not found or unreadable; sending without embedded logo:",
        errMsg
      );
    }

    // Process each reminder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of due as unknown[] as Array<Record<string, any>>) {
      const to = row.email;
      if (!to) {
        // Mark as failed to avoid retry storms
        await prisma.$executeRaw`
          UPDATE public.download_reminders SET status = 'failed', reminder_sent_at = ${now} WHERE id = ${row.id}
        `;
        continue;
      }

      const subject = `How was the course "${
        row.title ?? "your recent download"
      }"?`;
      // Build email HTML and include embedded logo data URI when available
      const logoImg = logoDataUri
        ? `<div style="margin-bottom:12px"><img src=\"${logoDataUri}\" alt=\"Coursify logo\" style=\"max-width:160px;height:auto;display:block;margin-bottom:8px;\"/></div>`
        : "";

      const html = `${logoImg}<p>Hi,</p><p>Thanks for downloading "${
        row.title ?? "the course"
      }". We'd love to hear your feedback — could you please rate it?</p><p><a href=\"https://your-site.example.com/courses/${
        row.resource_id
      }/rate\">Rate the course</a></p>`;

      const ok = await sendEmail(to, subject, html);

      if (ok) {
        await prisma.$executeRaw`
          UPDATE public.download_reminders SET status = 'sent', reminder_sent_at = ${now} WHERE id = ${row.id}
        `;
      } else {
        await prisma.$executeRaw`
          UPDATE public.download_reminders SET status = 'failed' WHERE id = ${row.id}
        `;
      }
    }

    return NextResponse.json({ processed: (due as unknown[]).length });
  } catch (err) {
    console.error("reminders/process error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
