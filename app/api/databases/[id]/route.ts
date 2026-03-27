import { NextResponse } from "next/server";
import connectDB from "../../../../lib/dbConnect";
import Database from "../../../../lib/models/Database";
import { getAuthUser } from "../../../../lib/authUser";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const authUser = await getAuthUser();

  if (!authUser?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deletedDatabase = await Database.findOneAndDelete({ _id: id, ownerId: authUser.userId });

    if (!deletedDatabase) {
      return NextResponse.json(
        { error: "Database not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete database" },
      { status: 500 }
    );
  }
}