import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ActivitySchema = new Schema(
  {
    activityId: { type: String, required: true, unique: true },
    memberId: { type: String, required: true },
    departmentId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["log", "task_update", "task_created", "task_comment"],
      required: true,
    },
    message: { type: String, required: true },
    timestamp: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export type ActivityDocument = InferSchemaType<typeof ActivitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Activity =
  mongoose.models.Activity ?? mongoose.model("Activity", ActivitySchema);
