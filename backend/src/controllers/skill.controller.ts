// Author: Florian Rischer
import { Request, Response } from 'express';
import Skill from '../models/Skill';

// GET all skills
export const getAllSkills = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    
    const skills = await Skill.find(filter).sort({ order: 1, proficiency: -1 });
    
    res.json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching skills'
    });
  }
};

// GET single skill
export const getSkill = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching skill'
    });
  }
};

// POST create new skill
export const createSkill = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.create(req.body);
    
    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while creating skill'
    });
  }
};

// PUT update skill
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      data: skill
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error while updating skill'
    });
  }
};

// DELETE skill
export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting skill'
    });
  }
};
