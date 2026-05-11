import { getDatabase, saveDatabase } from '../database/init.js'
import { randomUUID } from 'crypto'

export interface ExpertMode {
  id: string
  tenant_id: string | null
  creator_id: string | null
  name: string
  description: string | null
  system_prompt: string
  is_preset: number
  created_at: string
}

export interface CreateExpertModeInput {
  tenant_id: string | null
  creator_id?: string
  name: string
  description?: string
  system_prompt: string
  is_preset?: number
}

export class ExpertRepository {
  private get db() {
    return getDatabase()
  }

  create(input: CreateExpertModeInput): ExpertMode {
    const id = randomUUID()
    
    this.db.run(
      `INSERT INTO expert_modes (id, tenant_id, creator_id, name, description, system_prompt, is_preset) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, input.tenant_id, input.creator_id || null, input.name, input.description || null, input.system_prompt, input.is_preset || 0]
    )
    
    saveDatabase()
    return this.findById(id)!
  }

  findById(id: string): ExpertMode | undefined {
    const result = this.db.exec('SELECT * FROM expert_modes WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    return columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
  }

  findAll(): ExpertMode[] {
    const result = this.db.exec('SELECT * FROM expert_modes ORDER BY created_at DESC')
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  findPresets(): ExpertMode[] {
    const result = this.db.exec('SELECT * FROM expert_modes WHERE is_preset = 1')
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  findByTenantId(tenantId: string): ExpertMode[] {
    const result = this.db.exec('SELECT * FROM expert_modes WHERE tenant_id = ? OR tenant_id IS NULL ORDER BY created_at DESC', [tenantId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  findCustomByTenantId(tenantId: string): ExpertMode[] {
    const result = this.db.exec('SELECT * FROM expert_modes WHERE tenant_id = ? AND is_preset = 0 ORDER BY created_at DESC', [tenantId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  update(id: string, updates: Partial<Omit<ExpertMode, 'id' | 'created_at'>>): ExpertMode | undefined {
    const fields = Object.keys(updates)
    if (fields.length === 0) return this.findById(id)
    
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    const values = [...fields.map(f => updates[f]), id]
    
    this.db.run(`UPDATE expert_modes SET ${setClause} WHERE id = ?`, values)
    saveDatabase()
    return this.findById(id)
  }

  delete(id: string): boolean {
    const expert = this.findById(id)
    if (!expert) return false
    
    this.db.run('DELETE FROM expert_modes WHERE id = ?', [id])
    saveDatabase()
    return true
  }

  countByTenantId(tenantId: string): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM expert_modes WHERE tenant_id = ? AND is_preset = 0', [tenantId])
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }

  countPresets(): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM expert_modes WHERE is_preset = 1')
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }
}

export default new ExpertRepository()
