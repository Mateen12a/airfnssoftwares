import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IRegistrant extends Document {
  name: string;
  nameLower: string;
  createdAt: Date;
}

const RegistrantSchema = new Schema<IRegistrant>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    nameLower: { type: String, required: true, lowercase: true, index: true, unique: true },
  },
  { timestamps: true }
);

export const Registrant: Model<IRegistrant> =
  mongoose.models["Registrant"] ??
  mongoose.model<IRegistrant>("Registrant", RegistrantSchema);
