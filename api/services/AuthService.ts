import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userRepository, { type User, type CreateUserInput } from '../repositories/UserRepository.js'
import tenantRepository from '../repositories/TenantRepository.js'

export interface RegisterInput {
  email: string
  password: string
  name: string
  tenant_id?: string
  tenant_name?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>
  token: string
}

export class AuthService {
  private readonly jwtSecret: string
  private readonly jwtExpiresIn: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key'
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h'
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new Error('Email already registered')
    }

    let tenantId = input.tenant_id
    if (!tenantId) {
      if (!input.tenant_name) {
        throw new Error('Tenant ID or name is required')
      }
      const tenant = tenantRepository.create({
        name: input.tenant_name
      })
      tenantId = tenant.id
    } else {
      const tenant = tenantRepository.findById(tenantId)
      if (!tenant) {
        throw new Error('Tenant not found')
      }
    }

    const passwordHash = await bcrypt.hash(input.password, 10)
    
    const userInput: CreateUserInput = {
      email: input.email,
      password_hash: passwordHash,
      name: input.name,
      tenant_id: tenantId,
      role: 'user'
    }

    const user = userRepository.create(userInput)
    const { password_hash, ...userWithoutPassword } = user

    const token = this.generateToken(user)

    return {
      user: userWithoutPassword,
      token
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = userRepository.findByEmail(input.email)
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    const { password_hash, ...userWithoutPassword } = user

    const token = this.generateToken(user)

    return {
      user: userWithoutPassword,
      token
    }
  }

  verifyToken(token: string): User {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as User
      return decoded
    } catch {
      throw new Error('Invalid token')
    }
  }

  getUserById(id: string): Omit<User, 'password_hash'> | undefined {
    const user = userRepository.findById(id)
    if (!user) return undefined
    
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role
    }
    
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as jwt.SignOptions['expiresIn']
    })
  }
}

export default new AuthService()
