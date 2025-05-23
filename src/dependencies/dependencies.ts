import { followRepositoryImpl } from "../data/implements/followRepositoryImpl";
import { LoginRepositoryImpl } from "../data/implements/loginRepositoryImpl";
import { PostRepositoryImpl } from "../data/implements/postRepositoryImpl";
import { RegisterRepositoryImpl } from "../data/implements/registerRepositoryImpl";
import { UserRepositoryImpl } from "../data/implements/userRepositoryImpl";
import { followUsecase } from "../domain/usecases/followUsecase";
import { LoginUseCase } from "../domain/usecases/loginUsecase";
import { PostUseCase } from "../domain/usecases/postUsecase";
import { RegisterUseCase } from "../domain/usecases/RegisterUsecase";
import { UserUseCase } from "../domain/usecases/UserUsecase";

const authRepository = new LoginRepositoryImpl();
const RegisterRepository = new RegisterRepositoryImpl();
const postRepository = new PostRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const followRepository = new followRepositoryImpl();
export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(RegisterRepository),
  postUsecase: new PostUseCase(postRepository),
  userUsecase: new UserUseCase(userRepository),
  followUsecase: new followUsecase(followRepository),
};
