import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("http://localhost:8000/api/v1/1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock-token"
      },
      body: JSON.stringify({ message: "hello" })
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}
