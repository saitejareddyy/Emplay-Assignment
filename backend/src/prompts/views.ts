import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { redisClient } from '../config/redis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../config/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields: username, email, password.' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: email }, 
          { username: username }
        ] 
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Oops! That username or email is already taken.' });
    }

    // Hash the password for security (10 rounds is standard)
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { username, email, passwordHash }
    });

    console.log(`[Auth] New user registered: ${username}`);

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal server error during signup.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials provided.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`[Auth] Failed login attempt for email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials provided.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    console.log(`[Auth] User logged in: ${user.username}`);
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Failed to complete login request.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'You have been successfully logged out.' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found in system.' });
    }
    
    // Only return safe public info, NEVER the passwordHash
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

export const getPrompts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const prompts = await prisma.prompt.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { username: true } 
        }
      }
    });
    
    res.json(prompts);
  } catch (error) {
    console.error('List Prompts Error:', error);
    res.status(500).json({ error: 'Failed to retrieve prompt list.' });
  }
};

export const getPromptById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const prompt = await prisma.prompt.findUnique({ 
      where: { id },
      include: { author: { select: { username: true } }}
    });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found.' });
    }

    // Ownership Check
    if (prompt.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied. This prompt does not belong to you.' });
    }

    // Atomic view increment using Redis
    const viewKey = `prompt:${id}:views`;
    const viewCount = await redisClient.incr(viewKey);

    res.json({ ...prompt, view_count: viewCount });
  } catch (error) {
    console.error('Get Prompt Detail Error:', error);
    res.status(500).json({ error: 'Failed to load this prompt.' });
  }
};

export const createPrompt = async (req: AuthRequest, res: Response) => {
  const { title, content, complexity } = req.body;
  
  if (!title || !content || complexity === undefined) {
    return res.status(400).json({ error: 'Please fill out title, content, and complexity.' });
  }

  if (complexity < 1 || complexity > 10) {
    return res.status(400).json({ error: 'Complexity scale must be between 1 and 10.' });
  }

  try {
    const newPrompt = await prisma.prompt.create({
      data: { 
        title, 
        content, 
        complexity,
        authorId: req.user?.userId || null
      }
    });
    
    console.log(`[Prompts] New prompt created: ${title}`);
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Create Prompt Error:', error);
    res.status(500).json({ error: 'There was an issue saving your prompt.' });
  }
};

export const deletePrompt = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Check if the prompt exists and belongs to the user
    const prompt = await prisma.prompt.findUnique({ where: { id } });
    
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found.' });
    }

    if (prompt.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own prompts.' });
    }

    await prisma.prompt.delete({ where: { id } });
    
    await redisClient.del(`prompt:${id}:views`);
    
    console.log(`[Prompts] Prompt ${id} deleted by user ${userId}.`);
    res.json({ message: 'Prompt successfully deleted.' });
  } catch (error) {
    console.error('Delete Prompt Error:', error);
    res.status(500).json({ error: 'Failed to delete the prompt.' });
  }
};
