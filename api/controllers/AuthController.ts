import { type Request, type Response } from 'express'
import authService from '../services/AuthService.js'

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, tenant_id, tenant_name } = req.body

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password and name are required'
        })
        return
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        })
        return
      }

      const result = await authService.register({
        email,
        password,
        name,
        tenant_id,
        tenant_name
      })

      res.status(201).json({
        success: true,
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        })
        return
      }

      const result = await authService.login({ email, password })

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      res.status(401).json({
        success: false,
        error: message
      })
    }
  }

  logout(req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    })
  }

  getProfile(req: Request, res: Response): void {
    try {
      const userId = (req as any).user?.id
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const user = authService.getUserById(userId)
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: user
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }
}

export default new AuthController()
