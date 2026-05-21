import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  manager: string | { _id: string; name: string; email: string };
  members: Array<string | { _id: string; name: string; email: string }>;
  status?: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  manager?: string;
  members?: string[];
  status?: string;
  deadline?: string;
}

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createProject = createAsyncThunk<
  Project,
  {
    name: string;
    description?: string;
    manager?: string;
    members?: string[];
    deadline?: string;
  },
  { rejectValue: string }
>("project/createProject", async (projectData, { rejectWithValue }) => {
  try {
    const res = await axios.post("/projects/create", projectData, {
      headers: getAuthHeaders(),
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to create project",
    );
  }
});

export const getAllProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("project/getAllProjects", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/projects/all", {
      headers: getAuthHeaders(),
    });
    return res.data.projects as Project[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch projects",
    );
  }
});

export const getMyProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("project/getMyProjects", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get("/projects/my", {
      headers: getAuthHeaders(),
    });
    return res.data.projects as Project[];
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch my projects",
    );
  }
});

export const getProjectById = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("project/getProjectById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Project not found",
    );
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { id: string; updates: ProjectUpdate },
  { rejectValue: string }
>("project/updateProject", async ({ id, updates }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`/projects/update/${id}`, updates, {
      headers: getAuthHeaders(),
    });
    return res.data.project as Project;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to update project",
    );
  }
});

export const deleteProject = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("project/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`/projects/delete/${id}`, {
      headers: getAuthHeaders(),
    });
    return id;
  } catch (err) {
    const error = err as AxiosError<{ message: string }>;
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete project",
    );
  }
});

interface ProjectState {
  projects: Project[];
  myProjects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  lastCompletedProject?: Project;
}

const initialState: ProjectState = {
  projects: [],
  myProjects: [],
  currentProject: null,
  loading: false,
  error: null,
  success: false,
  lastCompletedProject: undefined,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearProjectSuccess: (state) => {
      state.success = false;
    },
    clearLastCompletedProject: (state) => {
      state.lastCompletedProject = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.myProjects.push(action.payload);
        state.success = true;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getMyProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.myProjects = action.payload;
      })
      .addCase(getMyProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;

        state.currentProject = updated;
        state.projects = state.projects.map((p) =>
          p._id === updated._id ? updated : p,
        );
        state.myProjects = state.myProjects.map((p) =>
          p._id === updated._id ? updated : p,
        );
        state.success = true;

        if (updated.status === "completed") {
          state.lastCompletedProject = updated;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })

      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
        state.myProjects = state.myProjects.filter(
          (p) => p._id !== action.payload,
        );
        if (state.currentProject?._id === action.payload) {
          state.currentProject = null;
        }
        state.success = true;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  },
});

export const {
  clearProjectError,
  clearProjectSuccess,
  clearLastCompletedProject,
} = projectSlice.actions;
export default projectSlice.reducer;
