import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    memberId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    departmentId: {
      type: String,
      default: "",
    },
    avatarColor: { type: String, required: true },
    initials: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User =
  mongoose.models.User ?? mongoose.model("User", UserSchema);
