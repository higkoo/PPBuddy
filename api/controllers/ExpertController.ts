import { type Request, type Response } from 'express'
import expertService from '../services/ExpertService.js'

export class ExpertController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const tenantId = (req as any).user?.tenant_id
      
      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const { name, description, system_prompt } = req.body

      if (!name || !system_prompt) {
        res.status(400).json({
          success: false,
          error: 'Name and system prompt are required'
        })
        return
      }

      const expert = expertService.create({
        tenant_id: tenantId,
        creator_id: userId,
        name,
        description,
        system_prompt,
        is_preset: 0
      })

      res.status(201).json({
        success: true,
        data: expert
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create expert mode'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const experts = expertService.findAll()

      res.status(200).json({
        success: true,
        data: experts
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expert modes'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getPresets(req: Request, res: Response): Promise<void> {
    try {
      const presets = expertService.findPresets()

      res.status(200).json({
        success: true,
        data: presets
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get preset expert modes'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getByTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenant_id
      
      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const experts = expertService.findByTenantId(tenantId)

      res.status(200).json({
        success: true,
        data: experts
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expert modes'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const expert = expertService.findById(id)
      
      if (!expert) {
        res.status(404).json({
          success: false,
          error: 'Expert mode not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: expert
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expert mode'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const tenantId = (req as any).user?.tenant_id
      const { id } = req.params
      const { name, description, system_prompt } = req.body
      
      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const expert = expertService.update(
        id,
        { name, description, system_prompt },
        userId,
        tenantId
      )
      
      if (!expert) {
        res.status(404).json({
          success: false,
          error: 'Expert mode not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: expert
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update expert mode'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const tenantId = (req as any).user?.tenant_id
      const { id } = req.params
      
      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const success = expertService.delete(id, userId, tenantId)
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Expert mode not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        message: 'Expert mode deleted successfully'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete expert mode'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getAllForTenant(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenant_id
      
      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const result = expertService.getAllForTenant(tenantId)

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get expert modes'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }
}

export default new ExpertController()
