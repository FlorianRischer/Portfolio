// Author: Florian Rischer
import { Request, Response } from 'express';
import Project from '../models/Project';

// GET all projects
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { category, featured, populate: shouldPopulate } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    
    let query = Project.find(filter).sort({ order: 1, createdAt: -1 });
    
    // Optionally populate thumbnail reference (demonstrate MongoDB populate)
    if (shouldPopulate === 'true') {
      query = query.populate('thumbnail', 'name slug mimeType');
    }
    
    const projects = await query;
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching projects'
    });
  }
};

// GET single project by ID or slug
export const getProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { populate: shouldPopulate } = req.query;
    
    // Try to find by ID first, then by slug
    let query = Project.findById(id).catch(() => null);
    let project = await query;
    
    if (!project) {
      // Try by slug with optional populate
      let slugQuery = Project.findOne({ slug: id });
      
      // Populate thumbnail and screen images (demonstrate MongoDB reference pattern)
      if (shouldPopulate === 'true') {
        slugQuery = slugQuery
          .populate('thumbnail', 'name slug mimeType')
          .populate('screens.image', 'name slug mimeType');
      }
      
      project = await slugQuery;
    } else if (shouldPopulate === 'true') {
      // If found by ID, also populate
      project = await Project.findById(id)
        .populate('thumbnail', 'name slug mimeType')
        .populate('screens.image', 'name slug mimeType');
    }
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching project'
    });
  }
};

// POST create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.create(req.body);
    
    res.status(201).json({
      success: true,
      data: project
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
      error: 'Server error while creating project'
    });
  }
};

// PUT update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
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
      error: 'Server error while updating project'
    });
  }
};

// DELETE project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting project'
    });
  }
};

// GET project statistics using MongoDB Aggregation Pipeline
// This demonstrates the powerful aggregation framework of MongoDB
export const getProjectStats = async (req: Request, res: Response) => {
  try {
    const stats = await Project.aggregate([
      // Stage 1: Group by category and calculate statistics
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          featuredCount: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          avgTechnologies: { $avg: { $size: '$technologies' } },
          totalScreens: { $sum: { $size: '$screens' } }
        }
      },
      // Stage 2: Sort by count descending
      {
        $sort: { count: -1 }
      },
      // Stage 3: Project/reshape the output
      {
        $project: {
          category: '$_id',
          count: 1,
          featuredCount: 1,
          avgTechnologies: { $round: ['$avgTechnologies', 1] },
          totalScreens: 1,
          _id: 0
        }
      }
    ]);

    // Get total counts
    const totals = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          totalFeatured: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          totalScreens: { $sum: { $size: '$screens' } },
          allTechnologies: { $push: '$technologies' }
        }
      },
      {
        $project: {
          _id: 0,
          totalProjects: 1,
          totalFeatured: 1,
          totalScreens: 1,
          // Flatten and get unique technologies
          uniqueTechnologies: {
            $size: {
              $reduce: {
                input: '$allTechnologies',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] }
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: stats,
        totals: totals[0] || {
          totalProjects: 0,
          totalFeatured: 0,
          totalScreens: 0,
          uniqueTechnologies: 0
        }
      }
    });
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching project statistics'
    });
  }
};
