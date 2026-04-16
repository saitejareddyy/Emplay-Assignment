import { Router, RequestHandler } from 'express';
import { getPrompts, getPromptById, createPrompt, deletePrompt, login, signup, logout, getMe } from './views';
import { authenticateToken } from '../config/auth';

const router = Router();

// Auth Endpoints
router.post('/auth/signup', signup as RequestHandler);
router.post('/auth/login', login as RequestHandler);
router.post('/auth/logout', logout as RequestHandler);
router.get('/auth/me', authenticateToken as RequestHandler, getMe as RequestHandler);

// Prompt Endpoints
router.get('/prompts', authenticateToken as RequestHandler, getPrompts as RequestHandler);
router.post('/prompts', authenticateToken as RequestHandler, createPrompt as RequestHandler);
router.get('/prompts/:id', authenticateToken as RequestHandler, getPromptById as RequestHandler);
router.delete('/prompts/:id', authenticateToken as RequestHandler, deletePrompt as RequestHandler);

export default router;
