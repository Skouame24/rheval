// ============================================================
// app/api/portail/photo/[id]/route.ts
// Photo de profil Microsoft 365 d'un collaborateur (proxy authentifié)
// ============================================================

import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!GUID.test(id)) {
    return new NextResponse(null, { status: 400 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const accessToken = token?.accessToken as string | undefined;
  if (!accessToken) {
    return new NextResponse(null, { status: 401 });
  }

  const headers = { Authorization: `Bearer ${accessToken}` };
  // Taille moyenne d'abord (léger), sinon la photo d'origine
  let res = await fetch(`https://graph.microsoft.com/v1.0/users/${id}/photos/240x240/$value`, { headers, cache: "no-store" });
  if (!res.ok && res.status !== 401) {
    res = await fetch(`https://graph.microsoft.com/v1.0/users/${id}/photo/$value`, { headers, cache: "no-store" });
  }

  if (!res.ok || !res.body) {
    // Pas de photo : le front affiche les initiales
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "private, max-age=3600" },
    });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
