import mongoose, { Schema, type InferSchemaType } from "mongoose";

const TaskCommentSchema = new Schema(
  {
    commentId: { type: String, required: true, unique: true },
    taskId: { type: String, required: true, index: true },
    memberId: { type: String, required: true },
    body: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

export type TaskCommentDocument = InferSchemaType<typeof TaskCommentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TaskComment =
  mongoose.models.TaskComment ??
  mongoose.model("TaskComment", TaskCommentSchema);
