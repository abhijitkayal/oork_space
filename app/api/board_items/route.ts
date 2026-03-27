import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import DatabaseItem from "@/lib/models/DatabaseItem";
import Database from "@/lib/models/Database";
import { getAuthUser } from "@/lib/authUser";

export async function GET(req: Request) {
  await connectDB();
  const authUser = await getAuthUser();
  if (!authUser?.userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const databaseId = searchParams.get("databaseId");

  if (!databaseId) {
    return NextResponse.json([], { status: 200 });
  }

  const ownedDatabase = await Database.findOne({ _id: databaseId, ownerId: authUser.userId }).select("_id");
  if (!ownedDatabase) return NextResponse.json([], { status: 200 });

  const items = await DatabaseItem.find({ databaseId, ownerId: authUser.userId }).sort({
    createdAt: -1,
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await connectDB();
  const authUser = await getAuthUser();
  if (!authUser?.userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { databaseId, values } = body;

  if (!databaseId) {
    return NextResponse.json(
      { message: "databaseId required" },
      { status: 400 }
    );
  }

  const ownedDatabase = await Database.findOne({ _id: databaseId, ownerId: authUser.userId }).select("_id");
  if (!ownedDatabase) {
    return NextResponse.json({ message: "Database not found" }, { status: 404 });
  }

  const created = await DatabaseItem.create({
    ownerId: authUser.userId,
    databaseId,
    values: values || {},
  });

  return NextResponse.json(created);
}