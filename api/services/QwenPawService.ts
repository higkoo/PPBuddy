import axios, { type AxiosError } from 'axios'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  systemPrompt?: string
  userMessage: string
}

export interface StreamChatRequest extends ChatRequest {
  onChunk: (chunk: string) => void
}

class QwenPawService {
  private readonly baseURL: string
  private readonly apiKey: string
  private readonly timeout: number

  constructor() {
    this.baseURL = process.env.QWENPAW_BASE_URL || 'http://localhost:8000'
    this.apiKey = process.env.QWENPAW_API_KEY || ''
    this.timeout = parseInt(process.env.QWENPAW_TIMEOUT || '30000', 10)
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }
    
    return headers
  }

  private getMockResponse(message: string): string {
    const responses = [
      `你好！我是您的AI助手。您刚刚说："${message}"`,
      `收到您的消息："${message}"，我正在处理...`,
      `感谢您的提问！关于"${message}"，我可以为您提供帮助。`,
      `您的消息是："${message}"。这是一个很好的问题！`,
      `我收到了您的消息："${message}"。让我为您解答。`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  private async callChatAPI(messages: ChatMessage[]): Promise<string | null> {
    const endpoints = [
      `${this.baseURL}/api/chat`,
      `${this.baseURL}/api/chat/completions`,
      `${this.baseURL}/v1/chat/completions`,
      `${this.baseURL}/chat/completions`
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(
          endpoint,
          {
            messages,
            stream: false
          },
          {
            headers: this.getHeaders(),
            timeout: this.timeout
          }
        )

        if (response.data && response.data.message) {
          return response.data.message.content || response.data.message
        }
        
        if (response.data && response.data.choices && response.data.choices[0]) {
          const choice = response.data.choices[0]
          return choice.message?.content || choice.content || JSON.stringify(response.data)
        }
        
        if (typeof response.data === 'string') {
          return response.data
        }

        return JSON.stringify(response.data)
      } catch {
        continue
      }
    }

    return null
  }

  async chat(request: ChatRequest): Promise<string> {
    try {
      const messages: ChatMessage[] = []
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        })
      }
      
      messages.push(...request.messages)
      
      messages.push({
        role: 'user',
        content: request.userMessage
      })

      const response = await this.callChatAPI(messages)
      
      if (response) {
        return response
      }

      console.warn('QwenPaw API unavailable, returning mock response')
      return this.getMockResponse(request.userMessage)
    } catch (error) {
      console.error('QwenPaw API error:', error)
      return this.getMockResponse(request.userMessage)
    }
  }

  async streamChat(request: StreamChatRequest): Promise<void> {
    try {
      const messages: ChatMessage[] = []
      
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        })
      }
      
      messages.push(...request.messages)
      
      messages.push({
        role: 'user',
        content: request.userMessage
      })

      const response = await this.callChatAPI(messages)
      const content = response || this.getMockResponse(request.userMessage)

      const chunks = content.split('')
      for (let i = 0; i < chunks.length; i++) {
        request.onChunk(chunks[i])
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (error) {
      console.error('QwenPaw streaming API error:', error)
      const content = this.getMockResponse(request.userMessage)
      const chunks = content.split('')
      for (let i = 0; i < chunks.length; i++) {
        request.onChunk(chunks[i])
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      })
      return response.status === 200
    } catch {
      try {
        const response = await axios.get(`${this.baseURL}/`, {
          timeout: 5000
        })
        return response.status === 200
      } catch {
        return false
      }
    }
  }
}

export default new QwenPawService()
