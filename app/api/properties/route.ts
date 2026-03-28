// import { NextResponse } from "next/server";
// import connectDB from "@/lib/dbConnect";
// import DatabaseProperty from "@/lib/models/GalleryProperty";

// export async function GET(req: Request) {
//   await connectDB();

//   const { searchParams } = new URL(req.url);
//   const databaseId = searchParams.get("databaseId");

//   if (!databaseId) {
//     return NextResponse.json({ message: "databaseId missing" }, { status: 400 });
//   }

//   const properties = await DatabaseProperty.find({ databaseId }).sort({
//     createdAt: 1,
//   });

//   return NextResponse.json(properties);
// }

// export async function POST(req: Request) {
//   await connectDB();
//   const body = await req.json();

//   const created = await DatabaseProperty.create(body);
//   return NextResponse.json(created);
// }


import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import DatabaseProperty from "@/lib/models/DatabaseProperty";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const databaseId = searchParams.get("databaseId");

  if (!databaseId) {
    return NextResponse.json({ message: "databaseId missing" }, { status: 400 });
  }

  const props = await DatabaseProperty.find({ databaseId }).sort({
    createdAt: 1,
  });

  return NextResponse.json(props);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  console.log("📝 Creating property with body:", body);

  if (!body.databaseId || !body.name || !body.type) {
    return NextResponse.json(
      { message: "databaseId, name, type required" },
      { status: 400 }
    );
  }

  try {
    const created = await DatabaseProperty.create({
      databaseId: body.databaseId,
      name: body.name,
      type: body.type,
      options: body.options || [],
      formula: body.formula || "",
    });

    console.log("✅ Created property:", created);
    return NextResponse.json(created);
  } catch (error) {
    console.error("❌ Error creating property:", error);
    return NextResponse.json(
      { message: "Failed to create property", error: String(error) },
      { status: 500 }
    );
  }
}
