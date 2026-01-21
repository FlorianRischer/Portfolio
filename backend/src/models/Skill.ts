// Author: Florian Rischer
import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  icon: string;
  category: 'design' | 'development' | 'tools';
  proficiency: number; // 1-5
  order: number;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      unique: true
    },
    icon: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['design', 'development', 'tools']
    },
    proficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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

// Index for faster queries
SkillSchema.index({ category: 1 });

export default mongoose.model<ISkill>('Skill', SkillSchema);
