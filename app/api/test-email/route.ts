import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Test endpoint to verify email configuration
 * Usage: GET http://localhost:3000/api/test-email?to=your-email@example.com
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const to = url.searchParams.get("to");

    if (!to) {
      return NextResponse.json(
        {
          error:
            'Missing "to" parameter. Usage: /api/test-email?to=your-email@example.com',
        },
        { status: 400 }
      );
    }

    const from = process.env.FROM_EMAIL;
    if (!from) {
      return NextResponse.json(
        { error: "FROM_EMAIL not configured in .env.local" },
        { status: 500 }
      );
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2E3135;">✅ Email Configuration Test</h2>
        <p>If you're reading this, your email setup is working correctly!</p>
        <p><strong>Sent from:</strong> ${from}</p>
        <p><strong>Sent to:</strong> ${to}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </div>
    `;

    // Try SMTP first
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
        secure: (process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject: "Test Email - EduResource",
        html: testHtml,
      });

      return NextResponse.json({
        success: true,
        method: "SMTP",
        messageId: info.messageId,
        from,
        to,
        message: `Email sent successfully via SMTP! Check ${to} inbox.`,
      });
    }

    // Fallback to SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: from },
          subject: "Test Email - EduResource",
          content: [{ type: "text/html", value: testHtml }],
        }),
      });

      if (res.ok) {
        return NextResponse.json({
          success: true,
          method: "SendGrid",
          from,
          to,
          message: `Email sent successfully via SendGrid! Check ${to} inbox.`,
        });
      } else {
        const error = await res.text();
        return NextResponse.json(
          { error: `SendGrid error: ${error}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "No email service configured. Set up SMTP or SendGrid in .env.local",
      },
      { status: 500 }
    );
  } catch (err) {
    console.error("test-email error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
