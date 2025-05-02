// src/data/repositories/authrepoimpl.ts
import { LoginRepository } from '../repositories/loginRepository'
import { loginApi } from '../api/loginApi'
import { User } from '../../domain/models/User'

export class LoginRepositoryImpl implements LoginRepository {
  async login(email: string, password: string): Promise<User> {
    console.log('login repo:', 3)
    
    return (await loginApi(email, password)) as any
  }
}
