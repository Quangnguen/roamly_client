import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import followReducer from './slices/followSlice'
import postReducer from './slices/postSlice'
import MemoryReducer from './slices/memorySlice'
import likeReducer from './slices/likeSlice'
import notificationReducer from './slices/notificationSlice'
import commentReuducer from './slices/commentSlice' // Ensure you have a comment reducer defined

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    follow: followReducer,
    post: postReducer,
    memory: MemoryReducer,
    like: likeReducer,
    notification: notificationReducer,
    comment: commentReuducer, // Ensure you have a comment reducer defined
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
