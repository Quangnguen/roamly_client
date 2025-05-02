import { LoginRepositoryImpl } from "../data/implements/loginRepositoryImpl";
import { PostRepositoryImpl } from "../data/implements/postRepositoryImpl";
import { RegisterRepositoryImpl } from "../data/implements/registerRepositoryImpl";
import { LoginUseCase } from "../domain/usecases/loginUsecase";
import { PostUseCase } from "../domain/usecases/postUsecase";
import { RegisterUseCase } from "../domain/usecases/RegisterUsecase";

const authRepository = new LoginRepositoryImpl();
const RegisterRepository = new RegisterRepositoryImpl();
const postRepository = new PostRepositoryImpl();

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(RegisterRepository),
  postUsecase: new PostUseCase(postRepository),
};
