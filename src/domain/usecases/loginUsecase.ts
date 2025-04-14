// src/domain/usecases/login.ts
import { LoginRepository } from '../../data/repositories/loginRepository'
import { User } from '../models/User'

export class LoginUseCase {
  constructor(private repo: LoginRepository) {}


  async execute(email: string, password: string): Promise<User> {
    console.log('Executing login use case with email:', email, 'and password:', password)
    return await this.repo.login(email, password)
  }
}
