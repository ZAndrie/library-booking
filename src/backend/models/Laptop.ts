import mongoose, { Schema, Model } from 'mongoose';

export interface ILaptop {
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  specs: string;
  status: 'available' | 'borrowed' | 'under_maintenance' | 'decommissioned';
  condition: 'excellent' | 'good' | 'fair' | 'damaged';
  accessoriesIncluded: string[];
  location: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LaptopSchema = new Schema<ILaptop>(
  {
    assetTag: { type: String, required: true, unique: true, uppercase: true, trim: true },
    serialNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    specs: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['available', 'borrowed', 'under_maintenance', 'decommissioned'],
      default: 'available',
      index: true,
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'damaged'],
      default: 'excellent',
    },
    accessoriesIncluded: [{ type: String, trim: true }],
    location: { type: String, default: 'Counter Desk Shelf A', trim: true },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Laptop: Model<ILaptop> =
  mongoose.models.Laptop || mongoose.model<ILaptop>('Laptop', LaptopSchema);

export default Laptop;
