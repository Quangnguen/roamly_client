import { followRepositoryImpl } from "../data/implements/followRepositoryImpl";
import { LoginRepositoryImpl } from "../data/implements/loginRepositoryImpl";
import { MemoryRepositoryImpl } from "../data/implements/memoryRepositoryImpl";
import { PostRepositoryImpl } from "../data/implements/postRepositoryImpl";
import { RegisterRepositoryImpl } from "../data/implements/registerRepositoryImpl";
import { UserRepositoryImpl } from "../data/implements/userRepositoryImpl";
import { followUsecase } from "../domain/usecases/followUsecase";
import { LoginUseCase } from "../domain/usecases/loginUsecase";
import { MemoryUseCase } from "../domain/usecases/memoryUsecase";
import { PostUseCase } from "../domain/usecases/postUsecase";
import { RegisterUseCase } from "../domain/usecases/RegisterUsecase";
import { UserUseCase } from "../domain/usecases/UserUsecase";
import { LikeRepositoryImpl } from "../data/implements/likeRepositoryImpl";
import { LikeUsecase } from "../domain/usecases/likeUsecase";
import { NotificationRepositoryImpl } from "../data/implements/notificationRepositoryImpl";
import { NotificationUsecase } from "../domain/usecases/notificationUsecase";
import { ChatUsecase } from "../domain/usecases/chatUsecase";
import { ChatRepositoryImpl } from "../data/implements/chatRepositoryImpl";
import { CommentRepositoryImpl } from "../data/implements/commentRepositoryImpl";
import { CommentUsecase } from "../domain/usecases/commentUsecase";

const authRepository = new LoginRepositoryImpl();
const RegisterRepository = new RegisterRepositoryImpl();
const postRepository = new PostRepositoryImpl();
const userRepository = new UserRepositoryImpl();
const followRepository = new followRepositoryImpl();
const memoryRepository = new MemoryRepositoryImpl();
const likeRepository = new LikeRepositoryImpl();
const notificationRepository = new NotificationRepositoryImpl();
const chatRepository = new ChatRepositoryImpl();
const commentRepository = new CommentRepositoryImpl();

export const dependencies = {
  loginUseCase: new LoginUseCase(authRepository),
  registerUseCase: new RegisterUseCase(RegisterRepository),
  postUsecase: new PostUseCase(postRepository),
  userUsecase: new UserUseCase(userRepository),
  followUsecase: new followUsecase(followRepository),
  MemoryUseCase: new MemoryUseCase(memoryRepository),
  likeUsecase: new LikeUsecase(likeRepository),
  notificationUsecase: new NotificationUsecase(notificationRepository),
  chatUsecase: new ChatUsecase(chatRepository),
  commentUsecase: new CommentUsecase(commentRepository),
};