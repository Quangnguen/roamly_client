import { LoginRepositoryImpl } from "../data/implements/loginRepositoryImpl";
import { LoginUseCase } from "../domain/usecases/loginUsecase";

const authRepository = new LoginRepositoryImpl();

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
};
