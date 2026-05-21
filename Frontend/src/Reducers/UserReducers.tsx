import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  loading: false,
  error: null,
  success: false,
};


export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("users/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get("/users/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch profile"
    );
  }
});

export const updateMyProfile = createAsyncThunk<
  User,
  FormData,
  { rejectValue: string }
>("users/updateMyProfile", async (formData, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put("/users/me/update", formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data", // ફાઈલ અપલોડ માટે જરૂરી
      },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update profile"
    );
  }
});

export const getAllUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/getAllUsers", async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get("/users/all", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data as User[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch users"
    );
  }
});

export const getUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/getUserById", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.get(`/users/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "User not found");
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; formData: FormData },
  { rejectValue: string }
>("users/updateUser", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    const res = await axios.put(`/users/update/${id}`, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data as User;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update user"
    );
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/deleteUser", async (id, { rejectWithValue }) => {
  try {
    const token = Cookies.get("token");
    await axios.delete(`/users/delete/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete user"
    );
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = false;
    },
    resetUsersState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(updateMyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.success = true;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
        if (state.selectedUser?._id === action.payload._id)
          state.selectedUser = action.payload;
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload);
        if (state.selectedUser?._id === action.payload)
          state.selectedUser = null;
        state.success = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearUserError, clearUserSuccess, resetUsersState } =
  userSlice.actions;
export default userSlice.reducer;