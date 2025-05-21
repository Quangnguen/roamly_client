import { LoginRepositoryImpl } from "../data/implements/loginRepositoryImpl";
import { PostRepositoryImpl } from "../data/implements/postRepositoryImpl";
import { RegisterRepositoryImpl } from "../data/implements/registerRepositoryImpl";
import { UserRepositoryImpl } from "../data/implements/userRepositoryImpl";
import { LoginUseCase } from "../domain/usecases/loginUsecase";
import { PostUseCase } from "../domain/usecases/postUsecase";
import { RegisterUseCase } from "../domain/usecases/RegisterUsecase";
import { UserUseCase } from "../domain/usecases/UserUsecase";

const authRepository = new LoginRepositoryImpl();
const RegisterRepository = new RegisterRepositoryImpl();
const postRepository = new PostRepositoryImpl();
const userRepository = new UserRepositoryImpl();

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(RegisterRepository),
  postUsecase: new PostUseCase(postRepository),
  userUsecase: new UserUseCase(userRepository),
};
