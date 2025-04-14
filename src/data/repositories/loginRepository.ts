// src/data/repositories/authrepo.ts
import { User } from '../../domain/models/User'

export interface LoginRepository {
  login(email: string, password: string): Promise<User>
}
