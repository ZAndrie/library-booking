import mongoose, { Schema, Model } from 'mongoose';

export interface ISetting {
  minRoomCapacity: number;
  maxRoomCapacity: number;
  maxSlotDurationHours: number;
  operatingHoursStart: string;
  operatingHoursEnd: string;
  overdueGraceMinutes: number;
  updatedByStaffId?: mongoose.Types.ObjectId;
  updatedAt?: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    minRoomCapacity: { type: Number, default: 3, required: true },
    maxRoomCapacity: { type: Number, default: 15, required: true },
    maxSlotDurationHours: { type: Number, default: 2, required: true },
    operatingHoursStart: { type: String, default: '08:00', required: true },
    operatingHoursEnd: { type: String, default: '17:00', required: true },
    overdueGraceMinutes: { type: Number, default: 15, required: true },
    updatedByStaffId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
