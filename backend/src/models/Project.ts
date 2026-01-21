// Author: Florian Rischer
import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for populated thumbnail (when using populate())
export interface IProjectPopulated extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: 'ux-design' | 'ui-design' | 'branding' | 'web-development';
  technologies: string[];
  thumbnail: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    mimeType: string;
  };
  thumbnailUrl: string; // Keep for backward compatibility
  images: string[];
  screens: {
    title: string;
    description: string;
    image: Types.ObjectId; // Reference to Image
    imageUrl: string; // Keep for backward compatibility
  }[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: 'ux-design' | 'ui-design' | 'branding' | 'web-development';
  technologies: string[];
  thumbnail: Types.ObjectId; // Reference to Image model
  thumbnailUrl: string; // Keep for backward compatibility
  images: string[];
  screens: {
    title: string;
    description: string;
    image: Types.ObjectId; // Reference to Image
    imageUrl: string; // Keep for backward compatibility
  }[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    shortDescription: {
      type: String,
      required: true,
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    category: {
      type: String,
      required: true,
      enum: ['ux-design', 'ui-design', 'branding', 'web-development']
    },
    technologies: [{
      type: String,
      trim: true
    }],
    // ObjectId Reference to Image model (MongoDB Reference Pattern)
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Image'
    },
    // Keep thumbnailUrl for backward compatibility
    thumbnailUrl: {
      type: String,
      required: true
    },
    images: [{
      type: String
    }],
    screens: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      // ObjectId Reference to Image model
      image: { 
        type: Schema.Types.ObjectId, 
        ref: 'Image' 
      },
      // Keep imageUrl for backward compatibility
      imageUrl: { type: String, required: true }
    }],
    liveUrl: {
      type: String,
      trim: true
    },
    githubUrl: {
      type: String,
      trim: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indices for faster queries
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ featured: 1 });
ProjectSchema.index({ slug: 1 });

// Virtual for calculating screen count
ProjectSchema.virtual('screenCount').get(function() {
  return this.screens ? this.screens.length : 0;
});

// Ensure virtuals are included when converting to JSON
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
