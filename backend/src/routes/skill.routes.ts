// Author: Florian Rischer
import { Router } from 'express';
import {
  getAllSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skill.controller';

const router = Router();

// GET /api/skills - Get all skills
router.get('/', getAllSkills);

// GET /api/skills/:id - Get single skill
router.get('/:id', getSkill);

// POST /api/skills - Create new skill
router.post('/', createSkill);

// PUT /api/skills/:id - Update skill
router.put('/:id', updateSkill);

// DELETE /api/skills/:id - Delete skill
router.delete('/:id', deleteSkill);

export default router;
