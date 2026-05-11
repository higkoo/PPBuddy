import { type Request, type Response } from 'express'
import chatService from '../services/ChatService.js'

export class ChatController {
  async chat(req: Request, res: Response): Promise<void> {
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

      const { conversationId, expertModeId, message } = req.body

      if (!message) {
        res.status(400).json({
          success: false,
          error: 'Message content is required'
        })
        return
      }

      let conversationIdToUse = conversationId

      if (!conversationIdToUse) {
        const title = expertModeId ? 'Expert Chat' : 'New Conversation'
        const conversation = chatService.createConversation({
          tenant_id: tenantId,
          user_id: userId,
          title,
          expert_mode_id: expertModeId
        })
        conversationIdToUse = conversation.id
      }

      const result = await chatService.sendMessage({
        conversation_id: conversationIdToUse,
        user_id: userId,
        tenant_id: tenantId,
        content: message
      })

      res.status(200).json({
        success: true,
        data: {
          conversation: result.conversation,
          message: result.assistantMessage
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async streamChat(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id
    const tenantId = (req as any).user?.tenant_id
    const { conversationId, expertModeId, message } = req.query

    if (!userId || !tenantId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
      return
    }

    if (!message) {
      res.status(400).json({
        success: false,
        error: 'Message content is required'
      })
      return
    }

    let conversationIdToUse = conversationId as string

    if (!conversationIdToUse) {
      const title = expertModeId ? 'Expert Chat' : 'New Conversation'
      const conversation = chatService.createConversation({
        tenant_id: tenantId,
        user_id: userId,
        title,
        expert_mode_id: expertModeId as string
      })
      conversationIdToUse = conversation.id
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      await chatService.sendStreamingMessage(
        {
          conversation_id: conversationIdToUse,
          user_id: userId,
          tenant_id: tenantId,
          content: message as string
        },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        }
      )

      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
      res.end()
    }
  }

  async createConversation(req: Request, res: Response): Promise<void> {
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

      const { title, expert_mode_id } = req.body

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Conversation title is required'
        })
        return
      }

      const conversation = chatService.createConversation({
        tenant_id: tenantId,
        user_id: userId,
        title,
        expert_mode_id
      })

      res.status(201).json({
        success: true,
        data: conversation
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create conversation'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
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

      const conversations = chatService.getUserConversations(userId, tenantId)

      res.status(200).json({
        success: true,
        data: conversations
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get conversations'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async getConversation(req: Request, res: Response): Promise<void> {
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

      const conversation = chatService.getConversation(id, userId, tenantId)
      
      if (!conversation) {
        res.status(404).json({
          success: false,
          error: 'Conversation not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: conversation
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get conversation'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async updateConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const tenantId = (req as any).user?.tenant_id
      const { id } = req.params
      const { title, expert_mode_id } = req.body
      
      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      const conversation = chatService.updateConversation(
        id,
        { title, expert_mode_id },
        userId,
        tenantId
      )
      
      if (!conversation) {
        res.status(404).json({
          success: false,
          error: 'Conversation not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: conversation
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update conversation'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async deleteConversation(req: Request, res: Response): Promise<void> {
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

      const success = chatService.deleteConversation(id, userId, tenantId)
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Conversation not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete conversation'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
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

      const messages = chatService.getMessages(id, userId, tenantId)

      res.status(200).json({
        success: true,
        data: messages
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get messages'
      res.status(500).json({
        success: false,
        error: message
      })
    }
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const tenantId = (req as any).user?.tenant_id
      const { conversation_id, content } = req.body
      
      if (!userId || !tenantId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        })
        return
      }

      if (!conversation_id || !content) {
        res.status(400).json({
          success: false,
          error: 'Conversation ID and content are required'
        })
        return
      }

      const result = await chatService.sendMessage({
        conversation_id,
        user_id: userId,
        tenant_id: tenantId,
        content
      })

      res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }

  async sendStreamingMessage(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user?.id
    const tenantId = (req as any).user?.tenant_id
    const { conversation_id, content } = req.body
    
    if (!userId || !tenantId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized'
      })
      return
    }

    if (!conversation_id || !content) {
      res.status(400).json({
        success: false,
        error: 'Conversation ID and content are required'
      })
      return
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    try {
      await chatService.sendStreamingMessage(
        {
          conversation_id,
          user_id: userId,
          tenant_id: tenantId,
          content
        },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
        }
      )

      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message'
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`)
      res.end()
    }
  }

  async deleteMessage(req: Request, res: Response): Promise<void> {
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

      const success = chatService.deleteMessage(id, userId, tenantId)
      
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete message'
      res.status(400).json({
        success: false,
        error: message
      })
    }
  }
}

export default new ChatController()
