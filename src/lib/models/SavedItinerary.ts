import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedItinerary extends Document {
  destination: string;
  durationDays: number;
  totalBudgetUSD: number;
  totalBudgetINR: number;
  itineraryMarkdown: string;
  createdAt: Date;
}

const SavedItinerarySchema = new Schema<ISavedItinerary>(
  {
    destination: { type: String, required: true },
    durationDays: { type: Number, default: 4 },
    totalBudgetUSD: { type: Number, default: 0 },
    totalBudgetINR: { type: Number, default: 0 },
    itineraryMarkdown: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SavedItinerary: Model<ISavedItinerary> =
  mongoose.models.SavedItinerary ||
  mongoose.model<ISavedItinerary>("SavedItinerary", SavedItinerarySchema);
