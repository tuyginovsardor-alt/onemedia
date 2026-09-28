import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse("7bed8da3d8e1b0f6e2d68e3fb300fa4753bd193f", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
