import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TaskSchema = new Schema(
  {
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    departmentId: { type: String, required: true, index: true },
    createdById: { type: String, required: true },
    assigneeIds: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "ongoing", "delivered"],
      required: true,
    },
    dueDate: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: true },
);

export type TaskDocument = InferSchemaType<typeof TaskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Task =
  mongoose.models.Task ?? mongoose.model("Task", TaskSchema);
