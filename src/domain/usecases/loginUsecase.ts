// src/domain/usecases/login.ts
import { LoginRepository } from '../../data/repositories/loginRepository'
import { User } from '../models/User'

export class LoginUseCase {
  constructor(private repo: LoginRepository) { }

  async execute(email: string, password: string): Promise<User> {
    return await this.repo.login(email, password)
  }

  async logout(): Promise<void> {
    // Implement logout logic if needed
    return await this.repo.logout()
  }
}
