import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DailyLogSchema = new Schema(
  {
    logId: { type: String, required: true, unique: true },
    memberId: { type: String, required: true, index: true },
    departmentId: { type: String, required: true, index: true },
    taskId: { type: String },
    taskTitle: { type: String },
    date: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    imageUrl: { type: String },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

export type DailyLogDocument = InferSchemaType<typeof DailyLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyLog =
  mongoose.models.DailyLog ?? mongoose.model("DailyLog", DailyLogSchema);
