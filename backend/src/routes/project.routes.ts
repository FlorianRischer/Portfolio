// Author: Florian Rischer
import { Router } from 'express';
import {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/project.controller';

const router = Router();

// GET /api/projects/stats - Get project statistics (aggregation)
// Must be before /:id route to avoid conflict
router.get('/stats', getProjectStats);

// GET /api/projects - Get all projects
router.get('/', getAllProjects);

// GET /api/projects/:id - Get single project by ID or slug
router.get('/:id', getProject);

// POST /api/projects - Create new project
router.post('/', createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject);

export default router;
