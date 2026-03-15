import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Database from "@/lib/models/Database";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json([]);
  const dbs = await Database.find({ projectId }).sort({ createdAt: 1 });
  return NextResponse.json(dbs);
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    console.log("POST /api/databases body:", body);

    // ✅ Validate required fields and return clear errors
    if (!body.projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }
    if (!body.name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    if (!body.viewType) {
      return NextResponse.json(
        { error: "viewType is required" },
        { status: 400 }
      );
    }

    const db = await Database.create({
      projectId: body.projectId,
      name: body.name,
      icon: body.icon || "📄",
      viewType: body.viewType,
      templateName: body.templateName || "blank",
    });

    console.log("Created database:", db);
    return NextResponse.json(db);
  } catch (err: any) {
    console.error("POST /api/databases error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}