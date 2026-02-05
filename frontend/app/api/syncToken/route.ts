import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Always return success for mock implementation
    const response = NextResponse.json({ success: true });

    // Set mock cookies if token provided
    if (body.token) {
      response.cookies.set("access_token", body.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
      });
    }

    if (body.userId) {
      response.cookies.set("user_id", body.userId.toString(), {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}