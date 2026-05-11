import tenantRepository, { type Tenant, type CreateTenantInput } from '../repositories/TenantRepository.js'
import userRepository from '../repositories/UserRepository.js'

export interface UpdateTenantInput {
  name?: string
  logo?: string
  config?: object
}

export class TenantService {
  create(input: CreateTenantInput): Tenant {
    if (!input.name || input.name.trim() === '') {
      throw new Error('Tenant name is required')
    }
    return tenantRepository.create(input)
  }

  findById(id: string): Tenant | undefined {
    return tenantRepository.findById(id)
  }

  findAll(): Tenant[] {
    return tenantRepository.findAll()
  }

  update(id: string, input: UpdateTenantInput): Tenant | undefined {
    const tenant = tenantRepository.findById(id)
    if (!tenant) {
      throw new Error('Tenant not found')
    }
    
    const updates: Record<string, string | null> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.logo !== undefined) updates.logo = input.logo
    if (input.config !== undefined) {
      updates.config = typeof input.config === 'object' ? JSON.stringify(input.config) : input.config as unknown as string
    }
    
    return tenantRepository.update(id, updates)
  }

  delete(id: string): boolean {
    const users = userRepository.findByTenantId(id)
    if (users.length > 0) {
      throw new Error('Cannot delete tenant with existing users')
    }
    return tenantRepository.delete(id)
  }

  getStats(tenantId: string): {
    userCount: number
    tenant: Tenant | undefined
  } {
    const tenant = tenantRepository.findById(tenantId)
    const userCount = userRepository.countByTenantId(tenantId)
    
    return {
      userCount,
      tenant
    }
  }
}

export default new TenantService()
