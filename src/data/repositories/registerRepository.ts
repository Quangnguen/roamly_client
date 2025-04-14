// src/domain/repositories/RegisterRepository.ts
import { User } from '../../domain/models/User'

export interface RegisterRepository {
  register(email: string, password: string, name: string): Promise<User>
}
