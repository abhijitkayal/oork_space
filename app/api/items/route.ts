import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import DatabaseItem from "@/lib/models/GalleryItem";
import Database from "@/lib/models/Database";
import DatabaseProperty from "@/lib/models/DatabaseProperty";
import { getAuthUser } from "@/lib/authUser";

export async function GET(req: Request) {
  await connectDB();
  const authUser = await getAuthUser();
  if (!authUser?.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const databaseId = searchParams.get("databaseId");
  const mode = searchParams.get("mode");

  if (!databaseId) {
    return NextResponse.json({ message: "databaseId missing" }, { status: 400 });
  }

  const ownedDb = await Database.findOne({ _id: databaseId, ownerId: authUser.userId }).select("_id");
  if (!ownedDb) {
    return NextResponse.json([], { status: 200 });
  }

  const query: Record<string, unknown> = { databaseId };

  if (mode === "assigned" && authUser.email) {
    const emailProps = await DatabaseProperty.find({
      databaseId,
      type: "email",
    }).select("_id");

    const emailMatches = emailProps.map((p) => ({
      [`values.${p._id.toString()}`]: authUser.email,
    }));

    if (!emailMatches.length) {
      return NextResponse.json([], { status: 200 });
    }

    query.$or = emailMatches;
  }

  const items = await DatabaseItem.find(query).sort({ createdAt: 1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await connectDB();
  const authUser = await getAuthUser();
  if (!authUser?.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.databaseId) {
    return NextResponse.json({ message: "databaseId missing" }, { status: 400 });
  }

  const ownedDb = await Database.findOne({ _id: body.databaseId, ownerId: authUser.userId }).select("_id");
  if (!ownedDb) {
    return NextResponse.json({ message: "Database not found" }, { status: 404 });
  }

  const values = body.values && typeof body.values === "object" ? body.values : {};

  const created = await DatabaseItem.create({
    databaseId: body.databaseId,
    title: body.title || (typeof values.title === "string" ? values.title : "Untitled"),
    values,
  });

  return NextResponse.json(created);
}