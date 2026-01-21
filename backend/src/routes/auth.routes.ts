// Author: Florian Rischer
// Auth Routes - Routes for authentication (signup, login, verify)
import { Router } from 'express';
import { signup, login, verify } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/signup - Create new user account
router.post('/signup', signup);

// POST /api/auth/login - Authenticate user and get token
router.post('/login', login);

// GET /api/auth/verify - Verify token validity
router.get('/verify', verify);

export default router;
