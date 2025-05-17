import { User } from '../domain/models/User';

export interface UserApiResponse {
  data?: User;
  message: string;
  status: string;
  statusCode: number;
  error?: string;
}