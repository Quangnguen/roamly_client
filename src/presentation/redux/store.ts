import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import followReducer from './slices/followSlice'
import postReducer from './slices/postSlice'
import MemoryReducer from './slices/memorySlice'
import likeReducer from './slices/likeSlice'
import notificationReducer from './slices/notificationSlice'
import chatReducer from './slices/chatSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    follow: followReducer,
    post: postReducer,
    memory: MemoryReducer,
    like: likeReducer,
    notification: notificationReducer,
    chat: chatReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
