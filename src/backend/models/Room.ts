import mongoose, { Schema, Model } from 'mongoose';

export interface IRoom {
  name: string;
  roomNumber: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'maintenance' | 'closed';
  location: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    facilities: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['available', 'maintenance', 'closed'],
      default: 'available',
      required: true,
    },
    location: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
