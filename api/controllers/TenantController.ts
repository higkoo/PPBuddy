import { type Request, type Response } from 'express'
import tenantService from '../services/TenantService.js'
import userRepository from '../repositories/UserRepository.js'

export class TenantController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, logo, config } = req.body

      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Tenant name is required'
        })
        return
      }

      const tenant = tenantService.create({ name, logo, config })

      res.status(201).json({
        success: true,
        data: tenant
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tenant'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const tenant = tenantService.findById(id)
      
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: tenant
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get tenant'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const tenants = tenantService.findAll()

      res.status(200).json({
        success: true,
        data: tenants
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get tenants'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { name, logo, config } = req.body

      const tenant = tenantService.update(id, { name, logo, config })
      
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: tenant
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tenant'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const success = tenantService.delete(id)
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        message: 'Tenant deleted successfully'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tenant'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const stats = tenantService.getStats(id)

      if (!stats.tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: stats
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get tenant stats'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const tenant = tenantService.findById(id)
      if (!tenant) {
        res.status(404).json({
          success: false,
          error: 'Tenant not found'
        })
        return
      }

      const users = userRepository.findByTenantId(id)
      const usersWithoutPassword = users.map(({ password_hash, ...user }) => user)

      res.status(200).json({
        success: true,
        data: usersWithoutPassword
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get tenant users'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }
}

export default new TenantController()
