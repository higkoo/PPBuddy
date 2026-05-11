import { getDatabase, saveDatabase } from '../database/init.js'
import { randomUUID } from 'crypto'

export interface User {
  id: string
  email: string
  password_hash: string
  name: string
  tenant_id: string
  role: string
  created_at: string
}

export interface CreateUserInput {
  email: string
  password_hash: string
  name: string
  tenant_id: string
  role?: string
}

export class UserRepository {
  private get db() {
    return getDatabase()
  }

  create(input: CreateUserInput): User {
    const id = randomUUID()
    
    this.db.run(
      `INSERT INTO users (id, email, password_hash, name, tenant_id, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [id, input.email, input.password_hash, input.name, input.tenant_id, input.role || 'user']
    )
    
    saveDatabase()
    return this.findById(id)!
  }

  findById(id: string): User | undefined {
    const result = this.db.exec('SELECT * FROM users WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    return columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
  }

  findByEmail(email: string): User | undefined {
    const result = this.db.exec('SELECT * FROM users WHERE email = ?', [email])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    return columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
  }

  findByTenantId(tenantId: string): User[] {
    const result = this.db.exec('SELECT * FROM users WHERE tenant_id = ?', [tenantId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  update(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): User | undefined {
    const fields = Object.keys(updates)
    if (fields.length === 0) return this.findById(id)
    
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    const values = [...fields.map(f => updates[f]), id]
    
    this.db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values)
    saveDatabase()
    return this.findById(id)
  }

  delete(id: string): boolean {
    const user = this.findById(id)
    if (!user) return false
    
    this.db.run('DELETE FROM users WHERE id = ?', [id])
    saveDatabase()
    return true
  }

  countByTenantId(tenantId: string): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM users WHERE tenant_id = ?', [tenantId])
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }
}

export default new UserRepository()
