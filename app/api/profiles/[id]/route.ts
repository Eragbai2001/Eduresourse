import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const userId = parts[parts.length - 1];
    if (!userId)
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    // Use Prisma.sql helper to avoid prepared statement issues during regional outages
    // Cast userId parameter to UUID since Profile.user_id is @db.Uuid
    const rows: unknown[] = await prisma.$queryRaw(
      Prisma.sql`
        SELECT user_id, display_name, full_name, avatar_url, email
        FROM public.profiles
        WHERE user_id = CAST(${userId} AS uuid)
        LIMIT 1
      `
    );

    const row = (rows?.[0] ?? null) as {
      user_id: string;
      display_name?: string;
      full_name?: string;
      avatar_url?: string;
      email?: string;
    } | null;

    // If no profile row, try to fetch from Supabase Auth (admin) using service role
    if (!row) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (serviceRoleKey && supabaseUrl) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const admin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
          });

          // Use admin API to get user by id. If method is unavailable, fall back to REST
          let authUser: unknown = null;
          // Use REST admin endpoint to fetch user metadata
          const res = await fetch(
            `${supabaseUrl}/auth/v1/admin/users/${userId}`,
            {
              headers: { Authorization: `Bearer ${serviceRoleKey}` },
            }
          );
          if (res.ok) authUser = await res.json();

          function isAuthUser(obj: unknown): obj is {
            email?: string;
            user_metadata?: Record<string, unknown>;
          } {
            return typeof obj === "object" && obj !== null && "email" in obj;
          }

          if (authUser && isAuthUser(authUser)) {
            // Map auth user fields to normalized profile shape
            const metadata = authUser.user_metadata ?? {};
            const display =
              (typeof metadata.display_name === "string" &&
                metadata.display_name) ||
              (typeof metadata.full_name === "string" && metadata.full_name) ||
              (typeof authUser.email === "string" ? authUser.email : null);
            const avatar =
              (typeof metadata.avatar_url === "string" &&
                metadata.avatar_url) ||
              (typeof metadata.avatar === "string" && metadata.avatar) ||
              null;

            const normalizedFromAuth = {
              user_id: userId,
              display_name: display,
              full_name: metadata.full_name ?? null,
              avatar_url: avatar,
              email: authUser.email ?? null,
            };

            // Try to resolve avatarPublicUrl using service client storage
            let avatarPublicUrl: string | null = null;
            if (avatar && /^https?:\/\//i.test(avatar)) {
              avatarPublicUrl = avatar;
            } else if (avatar) {
              try {
                const { data: pub } = admin.storage
                  .from("cover-photos")
                  .getPublicUrl(avatar);
                if (pub?.publicUrl) avatarPublicUrl = pub.publicUrl;
                else {
                  const { data: signed } = await admin.storage
                    .from("cover-photos")
                    .createSignedUrl(avatar, 60 * 60);
                  avatarPublicUrl = signed?.signedUrl ?? null;
                }
              } catch (e) {
                console.error("avatar resolve (admin) error", e);
              }
            }

            return NextResponse.json(
              { profile: normalizedFromAuth, avatarPublicUrl },
              { status: 200 }
            );
          }
        } catch (e) {
          console.error("service-role auth fetch error:", e);
        }
      }

      // No row and no admin fallback — return null
      return NextResponse.json(null, { status: 200 });
    }

    const normalized = {
      user_id: row.user_id,
      display_name: row.display_name ?? null,
      full_name: row.full_name ?? null,
      avatar_url: row.avatar_url ?? null,
      email: row.email ?? null,
    };

    let avatarPublicUrl: string | null = null;
    const raw = normalized.avatar_url ?? "";
    if (raw) {
      if (/^https?:\/\//i.test(raw)) {
        avatarPublicUrl = raw;
      } else {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (serviceRoleKey && supabaseUrl) {
          try {
            const { createClient } = await import("@supabase/supabase-js");
            const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
              auth: { persistSession: false },
            });

            const { data: pub } = serviceClient.storage
              .from("cover-photos")
              .getPublicUrl(raw);
            if (pub?.publicUrl) avatarPublicUrl = pub.publicUrl;
            else {
              const { data: signed } = await serviceClient.storage
                .from("cover-photos")
                .createSignedUrl(raw, 60 * 60);
              avatarPublicUrl = signed?.signedUrl ?? null;
            }
          } catch (e) {
            console.error("Error resolving avatar URL (service):", e);
          }
        }
      }
    }

    return NextResponse.json(
      { profile: normalized, avatarPublicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("profiles/[id] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
