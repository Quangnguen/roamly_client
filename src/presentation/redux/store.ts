import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import followReducer from './slices/followSlice'
import postReducer from './slices/postSlice'
import MemoryReducer from './slices/memorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    follow: followReducer,
    post: postReducer,
    memory: MemoryReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
