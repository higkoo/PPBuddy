import { getDatabase, saveDatabase } from '../database/init.js'
import { randomUUID } from 'crypto'

export interface Tenant {
  id: string
  name: string
  logo: string | null
  config: string | null
  created_at: string
}

export interface CreateTenantInput {
  name: string
  logo?: string
  config?: object
}

export class TenantRepository {
  private get db() {
    return getDatabase()
  }

  create(input: CreateTenantInput): Tenant {
    const id = randomUUID()
    const config = input.config ? JSON.stringify(input.config) : null
    
    this.db.run(
      `INSERT INTO tenants (id, name, logo, config) VALUES (?, ?, ?, ?)`,
      [id, input.name, input.logo || null, config]
    )
    
    saveDatabase()
    return this.findById(id)!
  }

  findById(id: string): Tenant | undefined {
    const result = this.db.exec('SELECT * FROM tenants WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    const tenant = columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
    
    if (tenant && tenant.config) {
      try {
        tenant.config = JSON.parse(tenant.config as unknown as string)
      } catch {
        tenant.config = null
      }
    }
    
    return tenant
  }

  findAll(): Tenant[] {
    const result = this.db.exec('SELECT * FROM tenants ORDER BY created_at DESC')
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => {
      const tenant = columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
      
      if (tenant.config) {
        try {
          tenant.config = JSON.parse(tenant.config as unknown as string)
        } catch {
          tenant.config = null
        }
      }
      return tenant
    })
  }

  update(id: string, updates: Partial<Omit<Tenant, 'id' | 'created_at'>>): Tenant | undefined {
    if (updates.config && typeof updates.config === 'object') {
      updates.config = JSON.stringify(updates.config) as unknown as string
    }
    
    const fields = Object.keys(updates)
    if (fields.length === 0) return this.findById(id)
    
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    const values = [...fields.map(f => updates[f]), id]
    
    this.db.run(`UPDATE tenants SET ${setClause} WHERE id = ?`, values)
    saveDatabase()
    return this.findById(id)
  }

  delete(id: string): boolean {
    const tenant = this.findById(id)
    if (!tenant) return false
    
    this.db.run('DELETE FROM tenants WHERE id = ?', [id])
    saveDatabase()
    return true
  }

  count(): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM tenants')
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }
}

export default new TenantRepository()
