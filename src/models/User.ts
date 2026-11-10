import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  employeeId: string;
  role: 'admin' | 'staff';
  passwordHash: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff', required: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
