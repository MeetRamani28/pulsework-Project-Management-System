import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface Notification {
  _id: string;
  user: string;
  project?: { _id: string; name: string; status: string };
  task?: { _id: string; title: string; status: string };
  event: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  success: null,
};

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserNotifications = createAsyncThunk<
  Notification[],
  string, // userId
  { rejectValue: string }
>("notifications/getUserNotifications", async (userId, thunkAPI) => {
  try {
    const { data } = await axios.get(`/notifications/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return data; 
  } catch (err) {
    const error: AxiosError<{ message: string }> = err as AxiosError<{
      message: string;
    }>;
    return thunkAPI.rejectWithValue(error.response?.data.message || "Error");
  }
});

export const markNotificationRead = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("notifications/markNotificationRead", async (id, thunkAPI) => {
  try {
    await axios.patch(
      `/notifications/${id}/read`,
      {},
      { headers: getAuthHeaders() },
    );
    return { id };
  } catch (err) {
    const error: AxiosError<{ message: string }> = err as AxiosError<{
      message: string;
    }>;
    return thunkAPI.rejectWithValue(error.response?.data.message || "Error");
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  string, 
  string,
  { rejectValue: string }
>("notifications/markAllNotificationsRead", async (userId, thunkAPI) => {
  try {
    await axios.patch(
      `/notifications/user/${userId}/read`,
      {},
      { headers: getAuthHeaders() },
    );
    return userId;
  } catch (err) {
    const error: AxiosError<{ message: string }> = err as AxiosError<{
      message: string;
    }>;
    return thunkAPI.rejectWithValue(error.response?.data.message || "Error");
  }
});

export const deleteNotification = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("notifications/deleteNotification", async (id, thunkAPI) => {
  try {
    await axios.delete(`/notifications/delete/${id}`, {
      headers: getAuthHeaders(),
    });
    return { id };
  } catch (err) {
    const error: AxiosError<{ message: string }> = err as AxiosError<{
      message: string;
    }>;
    return thunkAPI.rejectWithValue(error.response?.data.message || "Error");
  }
});

const NotificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    clearNotificationSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUserNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      getUserNotifications.fulfilled,
      (state, action: PayloadAction<Notification[]>) => {
        state.loading = false;
        state.notifications = action.payload;
      },
    );
    builder.addCase(getUserNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch notifications";
    });

    builder.addCase(
      markNotificationRead.fulfilled,
      (state, action: PayloadAction<{ id: string }>) => {
        state.notifications = state.notifications.map((n) =>
          n._id === action.payload.id ? { ...n, isRead: true } : n,
        );
      },
    );

    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
    });

    builder.addCase(
      deleteNotification.fulfilled,
      (state, action: PayloadAction<{ id: string }>) => {
        state.notifications = state.notifications.filter(
          (n) => n._id !== action.payload.id,
        );
      },
    );
  },
});

export const { clearNotificationError, clearNotificationSuccess } =
  NotificationSlice.actions;

export default NotificationSlice.reducer;
