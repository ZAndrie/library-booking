import mongoose, { Schema, Model } from 'mongoose';

export interface IRoomBooking {
  roomId: mongoose.Types.ObjectId;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  startTime: Date;
  endTime: Date;
  purpose: string;
  attendeesCount: number;
  status: 'active' | 'completed' | 'cancelled' | 'no_show';
  bookedByStaffId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const RoomBookingSchema = new Schema<IRoomBooking>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    borrowerName: { type: String, required: true, trim: true },
    borrowerId: { type: String, required: true, trim: true, uppercase: true },
    borrowerEmail: { type: String, trim: true, lowercase: true },
    borrowerContact: { type: String, trim: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    purpose: { type: String, required: true, trim: true },
    attendeesCount: { type: Number, default: 1, min: 1 },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'no_show'],
      default: 'active',
      index: true,
    },
    bookedByStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

RoomBookingSchema.index({ roomId: 1, status: 1, startTime: 1, endTime: 1 });

const RoomBooking: Model<IRoomBooking> =
  mongoose.models.RoomBooking || mongoose.model<IRoomBooking>('RoomBooking', RoomBookingSchema);

export default RoomBooking;
