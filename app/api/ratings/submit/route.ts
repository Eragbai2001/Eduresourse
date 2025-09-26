import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId');
    const ratingParam = url.searchParams.get('rating');
    const review = url.searchParams.get('review') ?? null;
    const userId = url.searchParams.get('userId') ?? null;

    if (!resourceId) {
      return new NextResponse('Missing resourceId', { status: 400 });
    }
    const score = ratingParam ? parseInt(ratingParam, 10) : NaN;
    if (!score || Number.isNaN(score) || score < 1 || score > 5) {
      return new NextResponse('Invalid rating (must be 1-5)', { status: 400 });
    }

    if (!userId) {
      // If the email link doesn't include a user id, ask the user to sign in.
      // Preserve the original query so they can be redirected back after auth.
      const redirectTo = `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`;
      return NextResponse.redirect(redirectTo);
    }

    const id = crypto.randomUUID();

    // Upsert using raw SQL to avoid depending on generated client compound unique
    // naming and to be explicit about the ON CONFLICT clause (user_id, resource_id).
    await prisma.$executeRaw`
      INSERT INTO public.ratings (id, user_id, resource_id, score, review, created_at, updated_at)
      VALUES (${id}, ${userId}, ${resourceId}, ${score}, ${review}, now(), now())
      ON CONFLICT (user_id, resource_id) DO UPDATE
      SET score = EXCLUDED.score, review = EXCLUDED.review, updated_at = now();
    `;

    // Return a tiny confirmation page (safe for email redirect).
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <title>Thanks for your feedback</title>
          <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f9fafb;color:#111827;padding:24px} .card{max-width:520px;margin:0 auto;background:#fff;border-radius:8px;padding:24px;border:1px solid #e5e7eb;text-align:center}</style>
        </head>
        <body>
          <div class="card">
            <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">Thanks — your rating was recorded</h1>
            <p style="margin:0 0 12px;color:#6b7280;">You rated this resource ${score} / 5.</p>
            <p style="margin:0;color:#6b7280;font-size:13px">Close this tab to return to your email.</p>
          </div>
        </body>
      </html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('ratings/submit error:', err);
    return new NextResponse('Server error', { status: 500 });
  }
}
