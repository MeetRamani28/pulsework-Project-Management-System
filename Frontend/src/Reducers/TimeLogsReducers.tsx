import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface Session {
  startedAt: string;
  endedAt?: string;
  duration?: number;
}

export interface TimeLog {
  _id: string;
  task: { _id: string; title: string };
  project: { _id: string; name: string };
  user: { _id: string; name: string; email: string };
  startTime: string;
  endTime?: string;
  isRunning: boolean;
  status: "running" | "paused" | "stopped";
  sessions: Session[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DailySummary {
  date: string; // yyyy-mm-dd
  totalHours: number; // decimal (e.g. 0.5, 2.75)
  formatted: string; // human readable (e.g. "0h 30m", "2h 45m")
  taskCount: number;
}

interface TimeLogState {
  logs: TimeLog[];
  currentLog: TimeLog | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  summary: DailySummary | null;
  summaries: DailySummary[];
}

const initialState: TimeLogState = {
  logs: [],
  currentLog: null,
  loading: false,
  error: null,
  success: false,
  summary: null,
  summaries: [],
};

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const startLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/startLog", async (taskId, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `/timelogs/start/${taskId}`,
      {},
      { headers: getAuthHeaders() },
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to start log",
    );
  }
});

export const pauseLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/pauseLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `/timelogs/pause/${id}`,
      {},
      { headers: getAuthHeaders() },
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to pause log",
    );
  }
});

export const resumeLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/resumeLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `/timelogs/resume/${id}`,
      {},
      { headers: getAuthHeaders() },
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to resume log",
    );
  }
});

export const stopLog = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/stopLog", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.put(
      `/timelogs/stop/${id}`,
      {},
      { headers: getAuthHeaders() },
    );
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to stop log",
    );
  }
});

export const getMyLogs = createAsyncThunk<
  TimeLog[],
  void,
  { rejectValue: string }
>("timelog/getMyLogs", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/timelogs/me", {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch my logs",
    );
  }
});

export const getAllLogs = createAsyncThunk<
  TimeLog[],
  void,
  { rejectValue: string }
>("timelog/getAllLogs", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/timelogs/getAllLogs", {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch logs",
    );
  }
});

export const getLogsByTask = createAsyncThunk<
  TimeLog[],
  string,
  { rejectValue: string }
>("timelog/getLogsByTask", async (taskId, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/timelogs/task/${taskId}`, {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch task logs",
    );
  }
});

export const getLogById = createAsyncThunk<
  TimeLog,
  string,
  { rejectValue: string }
>("timelog/getLogById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/timelogs/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data as TimeLog;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch log",
    );
  }
});

export const deleteLog = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("timelog/deleteLog", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/timelogs/delete/${id}`, {
      headers: getAuthHeaders(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete log",
    );
  }
});

export const getDailySummary = createAsyncThunk<
  DailySummary,
  string | void,
  { rejectValue: string }
>("timelog/getDailySummary", async (date, { rejectWithValue }) => {
  try {
    const res = await axios.get("/timelogs/summary", {
      headers: getAuthHeaders(),
      params: date ? { date } : {},
    });
    return res.data as DailySummary;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch daily summary",
    );
  }
});

export const getAllSummaries = createAsyncThunk<
  DailySummary[],
  void,
  { rejectValue: string }
>("timelog/getAllSummaries", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/timelogs/summaries", {
      headers: getAuthHeaders(),
    });
    return res.data as DailySummary[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch summaries",
    );
  }
});

const timeLogSlice = createSlice({
  name: "timelog",
  initialState,
  reducers: {
    clearTimeLogError: (state) => {
      state.error = null;
    },
    clearTimeLogSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    const handleUpdateLog = (state: TimeLogState, log: TimeLog) => {
      state.currentLog = log;
      state.logs = state.logs.map((l) => (l._id === log._id ? log : l));
      state.loading = false;
      state.success = true;
      state.error = null;
    };

    builder
      .addCase(startLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startLog.fulfilled, (state, action: PayloadAction<TimeLog>) => {
        state.loading = false;
        state.logs.push(action.payload);
        state.currentLog = action.payload;
        state.success = true;
      })
      .addCase(startLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to start log";
      });

    builder
      .addCase(pauseLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(pauseLog.fulfilled, (state, action) => {
        handleUpdateLog(state, action.payload);
      })
      .addCase(pauseLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(resumeLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(resumeLog.fulfilled, (state, action) => {
        handleUpdateLog(state, action.payload);
      })
      .addCase(resumeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(stopLog.pending, (state) => {
        state.loading = true;
      })
      .addCase(stopLog.fulfilled, (state, action) => {
        handleUpdateLog(state, action.payload);
      })
      .addCase(stopLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getMyLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getMyLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getAllLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getAllLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getLogsByTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLogsByTask.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(getLogsByTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getLogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLog = action.payload;
      })
      .addCase(getLogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder.addCase(deleteLog.fulfilled, (state, action) => {
      state.logs = state.logs.filter((log) => log._id !== action.payload);
      if (state.currentLog?._id === action.payload) state.currentLog = null;
    });

    builder
      .addCase(getDailySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailySummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(getDailySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });

    builder
      .addCase(getAllSummaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllSummaries.fulfilled,
        (state, action: PayloadAction<DailySummary[]>) => {
          state.loading = false;
          state.summaries = action.payload;
        },
      )
      .addCase(getAllSummaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const { clearTimeLogError, clearTimeLogSuccess } = timeLogSlice.actions;
export default timeLogSlice.reducer;
