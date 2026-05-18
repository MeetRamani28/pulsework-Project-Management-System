import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get("token") || null,
  loading: false,
  error: null,
  success: false,
};

// Login User
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email?: string; name?: string; password: string},
  { rejectValue: string }
>("auth/loginUser", async (credentials, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, credentials, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    return thunkAPI.rejectWithValue(
      err.response?.data?.message ?? "Login failed"
    );
  }
});

// Register User
export const registerUser = createAsyncThunk<
  { message: string; user: User },
  { name: string; email: string; password: string; roles?: string },
  { rejectValue: string }
>("auth/registerUser", async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, userData, {
      withCredentials: true,
    });
    return res.data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    return thunkAPI.rejectWithValue(
      err.response?.data?.message ?? "Registration failed"
    );
  }
});

// Get Current User
export const getCurrentUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, thunkAPI) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`${API_URL}/auth/me`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    return thunkAPI.rejectWithValue(
      err.response?.data?.message ?? "Failed to fetch user"
    );
  }
});

// Logout User
export const logoutUser = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("auth/logoutUser", async (_, thunkAPI) => {
  try {
    const res = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error: unknown) {
    const err = error as AxiosError<{ message: string }>;
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Logout failed"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          Cookies.set("token", action.payload.token, { expires: 7 });
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.success = false;
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getCurrentUser.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.loading = false;
          state.user = action.payload.user;
        }
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch user";
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        Cookies.remove("token");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";
      });
  },
});

export const { clearAuthError, clearAuthSuccess } = authSlice.actions;
export default authSlice.reducer;
