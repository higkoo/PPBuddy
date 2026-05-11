import { getDatabase, saveDatabase } from '../database/init.js'
import { randomUUID } from 'crypto'

export interface Conversation {
  id: string
  tenant_id: string
  user_id: string
  title: string
  expert_mode_id: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: string
  content: string
  created_at: string
}

export interface CreateConversationInput {
  tenant_id: string
  user_id: string
  title: string
  expert_mode_id?: string
}

export interface CreateMessageInput {
  conversation_id: string
  role: string
  content: string
}

export class ConversationRepository {
  private get db() {
    return getDatabase()
  }

  createConversation(input: CreateConversationInput): Conversation {
    const id = randomUUID()
    
    this.db.run(
      `INSERT INTO conversations (id, tenant_id, user_id, title, expert_mode_id) VALUES (?, ?, ?, ?, ?)`,
      [id, input.tenant_id, input.user_id, input.title, input.expert_mode_id || null]
    )
    
    saveDatabase()
    return this.findConversationById(id)!
  }

  findConversationById(id: string): Conversation | undefined {
    const result = this.db.exec('SELECT * FROM conversations WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    return columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
  }

  findConversationsByUserId(userId: string): Conversation[] {
    const result = this.db.exec('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC', [userId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  findConversationsByTenantId(tenantId: string): Conversation[] {
    const result = this.db.exec('SELECT * FROM conversations WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  updateConversation(id: string, updates: Partial<Omit<Conversation, 'id' | 'created_at'>>): Conversation | undefined {
    const fields = Object.keys(updates)
    if (fields.length === 0) return this.findConversationById(id)
    
    const setClause = fields.map(f => `${f} = ?`).join(', ')
    const values = [...fields.map(f => updates[f]), id]
    
    this.db.run(`UPDATE conversations SET ${setClause} WHERE id = ?`, values)
    saveDatabase()
    return this.findConversationById(id)
  }

  deleteConversation(id: string): boolean {
    const conversation = this.findConversationById(id)
    if (!conversation) return false
    
    this.db.run('DELETE FROM messages WHERE conversation_id = ?', [id])
    saveDatabase()
    this.db.run('DELETE FROM conversations WHERE id = ?', [id])
    saveDatabase()
    return true
  }

  createMessage(input: CreateMessageInput): Message {
    const id = randomUUID()
    
    this.db.run(
      `INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)`,
      [id, input.conversation_id, input.role, input.content]
    )
    
    saveDatabase()
    return this.findMessageById(id)!
  }

  findMessageById(id: string): Message | undefined {
    const result = this.db.exec('SELECT * FROM messages WHERE id = ?', [id])
    if (result.length === 0 || result[0].values.length === 0) return undefined
    
    const columns = result[0].columns
    const values = result[0].values[0]
    return columns.reduce((obj: any, col, i) => {
      obj[col] = values[i]
      return obj
    }, {})
  }

  findMessagesByConversationId(conversationId: string): Message[] {
    const result = this.db.exec('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC', [conversationId])
    if (result.length === 0) return []
    
    const columns = result[0].columns
    return result[0].values.map(values => 
      columns.reduce((obj: any, col, i) => {
        obj[col] = values[i]
        return obj
      }, {})
    )
  }

  deleteMessage(id: string): boolean {
    const message = this.findMessageById(id)
    if (!message) return false
    
    this.db.run('DELETE FROM messages WHERE id = ?', [id])
    saveDatabase()
    return true
  }

  deleteMessagesByConversationId(conversationId: string): number {
    const messages = this.findMessagesByConversationId(conversationId)
    const count = messages.length
    
    if (count > 0) {
      this.db.run('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
      saveDatabase()
    }
    return count
  }

  countConversationsByTenantId(tenantId: string): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM conversations WHERE tenant_id = ?', [tenantId])
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }

  countConversationsByUserId(userId: string): number {
    const result = this.db.exec('SELECT COUNT(*) as count FROM conversations WHERE user_id = ?', [userId])
    if (result.length === 0) return 0
    return result[0].values[0][0] as number
  }
}

export default new ConversationRepository()
