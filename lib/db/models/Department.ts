import mongoose, { Schema, type InferSchemaType } from "mongoose";

const DepartmentSchema = new Schema({
  departmentId: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  color: { type: String, required: true },
});

export type DepartmentDocument = InferSchemaType<typeof DepartmentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Department =
  mongoose.models.Department ??
  mongoose.model("Department", DepartmentSchema);
