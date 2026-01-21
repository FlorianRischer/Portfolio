// Author: Florian Rischer
// Auth Controller - Handles signup, login, and token verification
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Get JWT secret and expiration from environment variables
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

const getJWTExpiration = (): string => {
  // Default to 15 minutes if not specified
  return process.env.JWT_EXPIRATION || '15m';
};

// Generate JWT token
const generateToken = (userId: string, email: string): string => {
  const expirationTime = getJWTExpiration();
  return jwt.sign(
    { userId, email },
    getJWTSecret(),
    { expiresIn: expirationTime as jwt.SignOptions['expiresIn'] }
  );
};

/**
 * Sign up - Create a new user account
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'A user with this email already exists',
      });
      return;
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      name,
    });
    user.setPassword(password);
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during signup',
    });
  }
};

/**
 * Sign in - Authenticate user and return JWT token
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // User not found
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Validate password
    if (!user.validatePassword(password)) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during login',
    });
  }
};

/**
 * Verify - Check if JWT token is valid
 * GET /api/auth/verify
 */
export const verify = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, getJWTSecret()) as { userId: string; email: string };

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User no longer exists',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during verification',
    });
  }
};
