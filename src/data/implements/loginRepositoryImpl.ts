// src/data/repositories/authrepoimpl.ts
import { LoginRepository } from '../repositories/loginRepository'
import { loginApi, logoutApi } from '../api/loginApi'
import { User } from '../../domain/models/User'

export class LoginRepositoryImpl implements LoginRepository {
  async login(email: string, password: string): Promise<User> {
    console.log('login repo:', 3)
    
    return (await loginApi(email, password)) as any
  }

  async logout(): Promise<void> {
    // Implement logout logic if needed
    return ((await logoutApi()) as any) as void
  }
}
