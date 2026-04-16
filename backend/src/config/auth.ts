import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies.token;
  
  // Fallback map: Check the traditional Authorization Bearer header just in case 
  // an external client (like Postman) is trying to access the API without cookies
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing or expired. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log(`[Auth] Blocked request with invalid token signature.`);
      return res.status(403).json({ error: 'The provided token is invalid or corrupted.' });
    }
    
    req.user = user;
    next();
  });
};
