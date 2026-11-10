import mongoose, { Schema, Model } from 'mongoose';

export interface ILaptopLoan {
  laptopId: mongoose.Types.ObjectId;
  borrowerName: string;
  borrowerId: string;
  borrowerEmail?: string;
  borrowerContact?: string;
  borrowedAt: Date;
  dueAt: Date;
  returnedAt?: Date;
  status: 'active' | 'returned' | 'overdue' | 'lost';
  staffIssuerId?: mongoose.Types.ObjectId;
  staffReceiverId?: mongoose.Types.ObjectId;
  checkoutAccessories: string[];
  checkoutNotes?: string;
  returnCondition?: 'excellent' | 'good' | 'fair' | 'damaged';
  returnNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LaptopLoanSchema = new Schema<ILaptopLoan>(
  {
    laptopId: { type: Schema.Types.ObjectId, ref: 'Laptop', required: true, index: true },
    borrowerName: { type: String, required: true, trim: true },
    borrowerId: { type: String, required: true, trim: true, uppercase: true, index: true },
    borrowerEmail: { type: String, trim: true, lowercase: true },
    borrowerContact: { type: String, trim: true },
    borrowedAt: { type: Date, default: Date.now, required: true },
    dueAt: { type: Date, required: true, index: true },
    returnedAt: { type: Date },
    status: {
      type: String,
      enum: ['active', 'returned', 'overdue', 'lost'],
      default: 'active',
      index: true,
    },
    staffIssuerId: { type: Schema.Types.ObjectId, ref: 'User' },
    staffReceiverId: { type: Schema.Types.ObjectId, ref: 'User' },
    checkoutAccessories: [{ type: String, trim: true }],
    checkoutNotes: { type: String, default: '' },
    returnCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'damaged'],
    },
    returnNotes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const LaptopLoan: Model<ILaptopLoan> =
  mongoose.models.LaptopLoan || mongoose.model<ILaptopLoan>('LaptopLoan', LaptopLoanSchema);

export default LaptopLoan;
