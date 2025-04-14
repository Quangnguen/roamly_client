import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginUseCase } from "../../../domain/usecases/loginUsecase";
import { dependencies } from "../../../dependencies/dependencies";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const user = await dependencies.loginUseCase.execute(email, password);
      return user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
  } as any,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
