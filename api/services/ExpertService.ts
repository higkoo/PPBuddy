import expertRepository, { 
  type ExpertMode, 
  type CreateExpertModeInput 
} from '../repositories/ExpertRepository.js'
import userRepository from '../repositories/UserRepository.js'

export interface UpdateExpertModeInput {
  name?: string
  description?: string
  system_prompt?: string
}

export class ExpertService {
  create(input: CreateExpertModeInput): ExpertMode {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Expert mode name is required')
    }
    
    if (!input.system_prompt || input.system_prompt.trim() === '') {
      throw new Error('System prompt is required')
    }
    
    if (input.creator_id) {
      const user = userRepository.findById(input.creator_id)
      if (!user) {
        throw new Error('Creator not found')
      }
      if (!input.tenant_id) {
        input.tenant_id = user.tenant_id
      } else if (user.tenant_id !== input.tenant_id) {
        throw new Error('Creator does not belong to the specified tenant')
      }
    }
    
    return expertRepository.create(input)
  }

  findById(id: string): ExpertMode | undefined {
    return expertRepository.findById(id)
  }

  findAll(): ExpertMode[] {
    return expertRepository.findAll()
  }

  findPresets(): ExpertMode[] {
    return expertRepository.findPresets()
  }

  findByTenantId(tenantId: string): ExpertMode[] {
    return expertRepository.findByTenantId(tenantId)
  }

  findCustomByTenantId(tenantId: string): ExpertMode[] {
    return expertRepository.findCustomByTenantId(tenantId)
  }

  update(id: string, input: UpdateExpertModeInput, userId?: string, tenantId?: string): ExpertMode | undefined {
    const expert = expertRepository.findById(id)
    if (!expert) {
      throw new Error('Expert mode not found')
    }
    
    if (expert.is_preset === 1) {
      throw new Error('Cannot modify preset expert modes')
    }
    
    if (userId && tenantId) {
      const user = userRepository.findById(userId)
      if (!user || user.tenant_id !== tenantId) {
        throw new Error('Unauthorized to update this expert mode')
      }
    }
    
    return expertRepository.update(id, input)
  }

  delete(id: string, userId?: string, tenantId?: string): boolean {
    const expert = expertRepository.findById(id)
    if (!expert) {
      throw new Error('Expert mode not found')
    }
    
    if (expert.is_preset === 1) {
      throw new Error('Cannot delete preset expert modes')
    }
    
    if (userId && tenantId) {
      const user = userRepository.findById(userId)
      if (!user || user.tenant_id !== tenantId) {
        throw new Error('Unauthorized to delete this expert mode')
      }
    }
    
    return expertRepository.delete(id)
  }

  getAllForTenant(tenantId: string): {
    presets: ExpertMode[]
    custom: ExpertMode[]
  } {
    const presets = expertRepository.findPresets()
    const custom = expertRepository.findCustomByTenantId(tenantId)
    
    return {
      presets,
      custom
    }
  }
}

export default new ExpertService()
