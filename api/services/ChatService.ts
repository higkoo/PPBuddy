import conversationRepository, { 
  type Conversation, 
  type Message,
  type CreateConversationInput,
  type CreateMessageInput 
} from '../repositories/ConversationRepository.js'
import expertRepository from '../repositories/ExpertRepository.js'
import userRepository from '../repositories/UserRepository.js'
import qwenPawService from './QwenPawService.js'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SendMessageInput {
  conversation_id: string
  user_id: string
  tenant_id: string
  content: string
}

export interface CreateConversationParams {
  tenant_id: string
  user_id: string
  title: string
  expert_mode_id?: string
}

export class ChatService {
  createConversation(params: CreateConversationParams): Conversation {
    const user = userRepository.findById(params.user_id)
    if (!user) {
      throw new Error('User not found')
    }
    
    if (user.tenant_id !== params.tenant_id) {
      throw new Error('User does not belong to this tenant')
    }

    const conversationInput: CreateConversationInput = {
      tenant_id: params.tenant_id,
      user_id: params.user_id,
      title: params.title,
      expert_mode_id: params.expert_mode_id
    }

    return conversationRepository.createConversation(conversationInput)
  }

  getConversation(conversationId: string, userId: string, tenantId: string): Conversation | undefined {
    const conversation = conversationRepository.findConversationById(conversationId)
    
    if (!conversation) {
      return undefined
    }
    
    if (conversation.tenant_id !== tenantId || conversation.user_id !== userId) {
      throw new Error('Unauthorized access to conversation')
    }
    
    return conversation
  }

  getUserConversations(userId: string, tenantId: string): Conversation[] {
    const user = userRepository.findById(userId)
    if (!user || user.tenant_id !== tenantId) {
      throw new Error('User not found or unauthorized')
    }
    
    return conversationRepository.findConversationsByUserId(userId)
  }

  updateConversation(
    conversationId: string, 
    updates: { title?: string; expert_mode_id?: string },
    userId: string,
    tenantId: string
  ): Conversation | undefined {
    const conversation = this.getConversation(conversationId, userId, tenantId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    
    return conversationRepository.updateConversation(conversationId, updates)
  }

  deleteConversation(conversationId: string, userId: string, tenantId: string): boolean {
    const conversation = this.getConversation(conversationId, userId, tenantId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    
    return conversationRepository.deleteConversation(conversationId)
  }

  getMessages(conversationId: string, userId: string, tenantId: string): Message[] {
    const conversation = this.getConversation(conversationId, userId, tenantId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    
    return conversationRepository.findMessagesByConversationId(conversationId)
  }

  async sendMessage(input: SendMessageInput): Promise<{
    userMessage: Message
    assistantMessage: Message
    conversation: Conversation
  }> {
    const conversation = this.getConversation(input.conversation_id, input.user_id, input.tenant_id)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const userMessageInput: CreateMessageInput = {
      conversation_id: input.conversation_id,
      role: 'user',
      content: input.content
    }
    const userMessage = conversationRepository.createMessage(userMessageInput)

    const existingMessages = conversationRepository.findMessagesByConversationId(input.conversation_id)
    const chatHistory: ChatMessage[] = existingMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    let systemPrompt = ''
    if (conversation.expert_mode_id) {
      const expertMode = expertRepository.findById(conversation.expert_mode_id)
      if (expertMode) {
        systemPrompt = expertMode.system_prompt
      }
    }

    const assistantContent = await qwenPawService.chat({
      messages: chatHistory,
      systemPrompt,
      userMessage: input.content
    })

    const assistantMessageInput: CreateMessageInput = {
      conversation_id: input.conversation_id,
      role: 'assistant',
      content: assistantContent
    }
    const assistantMessage = conversationRepository.createMessage(assistantMessageInput)

    return {
      userMessage,
      assistantMessage,
      conversation
    }
  }

  async sendStreamingMessage(
    input: SendMessageInput,
    onChunk: (chunk: string) => void
  ): Promise<{ userMessage: Message; assistantMessage: Message; conversation: Conversation }> {
    const conversation = this.getConversation(input.conversation_id, input.user_id, input.tenant_id)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const userMessageInput: CreateMessageInput = {
      conversation_id: input.conversation_id,
      role: 'user',
      content: input.content
    }
    const userMessage = conversationRepository.createMessage(userMessageInput)

    const existingMessages = conversationRepository.findMessagesByConversationId(input.conversation_id)
    const chatHistory: ChatMessage[] = existingMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    let systemPrompt = ''
    if (conversation.expert_mode_id) {
      const expertMode = expertRepository.findById(conversation.expert_mode_id)
      if (expertMode) {
        systemPrompt = expertMode.system_prompt
      }
    }

    let fullResponse = ''
    await qwenPawService.streamChat({
      messages: chatHistory,
      systemPrompt,
      userMessage: input.content,
      onChunk: (chunk) => {
        fullResponse += chunk
        onChunk(chunk)
      }
    })

    const assistantMessageInput: CreateMessageInput = {
      conversation_id: input.conversation_id,
      role: 'assistant',
      content: fullResponse
    }
    const assistantMessage = conversationRepository.createMessage(assistantMessageInput)

    return {
      userMessage,
      assistantMessage,
      conversation
    }
  }

  deleteMessage(messageId: string, userId: string, tenantId: string): boolean {
    const message = conversationRepository.findMessageById(messageId)
    if (!message) {
      throw new Error('Message not found')
    }
    
    const conversation = this.getConversation(message.conversation_id, userId, tenantId)
    if (!conversation) {
      throw new Error('Unauthorized access')
    }
    
    return conversationRepository.deleteMessage(messageId)
  }
}

export default new ChatService()
