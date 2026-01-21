// Author: Florian Rischer
import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  name: string;
  slug: string;
  category: 'project' | 'skill' | 'general' | 'icon';
  mimeType: string;
  data: string; // Base64 encoded image data
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['project', 'skill', 'general', 'icon'],
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indices for faster queries
ImageSchema.index({ slug: 1 });
ImageSchema.index({ category: 1 });

export default mongoose.model<IImage>('Image', ImageSchema);
