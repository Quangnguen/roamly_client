// src/data/repositories/RegisterRepositoryImpl.ts
import { RegisterRepository } from '../repositories/registerRepository'
import { registerApi } from '../api/registerApi'
import { User } from '@/src/domain/models/User'

export class RegisterRepositoryImpl implements RegisterRepository {

  async register(email: string, password: string, name: string, username: string): Promise<User> {
    return (await registerApi(email, password, name, username)) as any
  }
}
