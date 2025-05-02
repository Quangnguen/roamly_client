// src/domain/usecases/RegisterUseCase.ts
import { RegisterRepository } from '../../data/repositories/registerRepository'
import { User } from '../models/User'

export class RegisterUseCase {
  constructor(private registerRepo: RegisterRepository) {}

  async execute(email: string, password: string, name: string, username: string): Promise<User> {
    return await this.registerRepo.register(email, password, name, username)
  }
}
