import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import authService from '../services/AuthService.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    tenant_id: string
    role: string
  }
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided'
    })
    return
  }

  const token = authHeader.substring(7)

  try {
    const decoded = authService.verifyToken(token)
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      tenant_id: decoded.tenant_id,
      role: decoded.role
    }
    
    next()
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      })
      return
    }

    next()
  }
}

export default { authenticate, requireRole }
