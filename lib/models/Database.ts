// import mongoose, { Schema, models, model } from "mongoose";

// const DatabaseSchema = new Schema(
//   {
//     projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
//     name: { type: String, required: true },
//     icon: { type: String, default: "📄" },
//     viewType: {
//       type: String,
//       enum: ["timeline", "table", "board", "gallery"],
//       default: "table",
//     },
//   },
//   { timestamps: true }
// );

// export default models.Database || model("Database", DatabaseSchema);

import mongoose, { Schema, models, model } from "mongoose";

const DatabaseSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "📄" },
    viewType: {
      type: String,
      enum: [
        "timeline",
        "table",
        "board",
        "gallery",
        "todo",
        "text",
        "heading",
        "bullatedlist",
        "numberlist",
        "pagelink",
        "presentation", // ✅ new
        "video",        // ✅ new
        "whiteboard",   // ✅ new
      ],
      default: "table",
    },
    templateName: { type: String, default: "blank" }, // ✅ new
  },
  { timestamps: true }
);

// Clear model cache in development to prevent stale schema issues
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Database;
}

export default models.Database || model("Database", DatabaseSchema);
