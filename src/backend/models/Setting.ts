import mongoose, { Schema, Model } from 'mongoose';
import { DEFAULT_SYSTEM_POLICIES, SystemPolicyData } from '@/lib/policyUtils';

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

const SETTINGS_CACHE_TTL_MS = 15_000;
let cachedPolicies: SystemPolicyData | null = null;
let cacheExpiresAt = 0;

export function invalidateSystemSettingsCache() {
  cachedPolicies = null;
  cacheExpiresAt = 0;
}

export async function getEffectiveSystemSettings(): Promise<SystemPolicyData> {
  if (cachedPolicies && Date.now() < cacheExpiresAt) {
    return { ...cachedPolicies };
  }
  try {
    const doc = await Setting.findOne().lean();
    if (!doc) return { ...DEFAULT_SYSTEM_POLICIES };
    const resolved: SystemPolicyData = {
      minRoomCapacity: Number(doc.minRoomCapacity ?? DEFAULT_SYSTEM_POLICIES.minRoomCapacity),
      maxRoomCapacity: Number(doc.maxRoomCapacity ?? DEFAULT_SYSTEM_POLICIES.maxRoomCapacity),
      maxSlotDurationHours: Number(doc.maxSlotDurationHours ?? DEFAULT_SYSTEM_POLICIES.maxSlotDurationHours),
      operatingHoursStart: doc.operatingHoursStart || DEFAULT_SYSTEM_POLICIES.operatingHoursStart,
      operatingHoursEnd: doc.operatingHoursEnd || DEFAULT_SYSTEM_POLICIES.operatingHoursEnd,
      overdueGraceMinutes: Number(doc.overdueGraceMinutes ?? DEFAULT_SYSTEM_POLICIES.overdueGraceMinutes),
    };
    cachedPolicies = resolved;
    cacheExpiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
    return { ...resolved };
  } catch {
    return { ...DEFAULT_SYSTEM_POLICIES };
  }
}

export default Setting;
