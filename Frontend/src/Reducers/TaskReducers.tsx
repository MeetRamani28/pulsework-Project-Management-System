import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  deadline?: string;
  project: string | { _id: string; name: string };
  assignedTo?: { _id: string; name: string };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high";
  deadline?: string;
  assignedTo?: string;
}

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


export const createTask = createAsyncThunk<
  Task,
  {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    deadline?: string;
    project: string;
    assignedTo?: string;
  },
  { rejectValue: string }
>("task/createTask", async (taskData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/tasks/create", taskData, {
      headers: getAuthHeaders(),
    });
    return res.data.task as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to create task",
    );
  }
});

export const getAllTasks = createAsyncThunk<
  Task[],
  void,
  { rejectValue: string }
>("task/getAllTasks", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/tasks/all", {
      headers: getAuthHeaders(),
    });
    return res.data as Task[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch tasks",
    );
  }
});

export const getTasksByProject = createAsyncThunk<
  Task[],
  string,
  { rejectValue: string }
>("task/getTasksByProject", async (projectId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/tasks/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return res.data as Task[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch tasks",
    );
  }
});

export const getTaskById = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/getTaskById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/tasks/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(error.response?.data?.message || "Task not found");
  }
});

export const updateTask = createAsyncThunk<
  Task,
  { id: string; updates: TaskUpdate },
  { rejectValue: string }
>("task/updateTask", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/tasks/update/${id}`, updates, {
      headers: getAuthHeaders(),
    });
    return res.data.updatedTask as Task;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update task",
    );
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("task/deleteTask", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/tasks/delete/${id}`, {
      headers: getAuthHeaders(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete task",
    );
  }
});

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  lastCompletedTask?: Task;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  success: false,
  lastCompletedTask: undefined,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTaskSuccess: (state) => {
      state.success = false;
    },
    clearLastCompletedTask: (state) => {
      state.lastCompletedTask = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.success = true;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getTasksByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.currentTask = updated;
        state.tasks = state.tasks.map((t) =>
          t._id === updated._id ? updated : t,
        );
        state.success = true;

        if (updated.status === "completed") {
          state.lastCompletedTask = updated;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
        state.success = true;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearTaskError, clearTaskSuccess, clearLastCompletedTask } =
  taskSlice.actions;
export default taskSlice.reducer;
