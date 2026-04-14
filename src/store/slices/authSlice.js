import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { initSocket, disconnectSocket } from '../../services/socket';
import toast from 'react-hot-toast';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data);
      const { user, accessToken } = res.data.data;
      // ✅ FIX 1: Save token ONLY after register — but do NOT mark as authenticated yet
      // User must verify email first before accessing dashboard
      localStorage.setItem('accessToken', accessToken);
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      initSocket(accessToken);
      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid email or password');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await api.post('/auth/logout'); } catch { /* ignore */ }
  localStorage.removeItem('accessToken');
  disconnectSocket();
});

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put('/users/profile', data);
      toast.success('Profile updated!');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    accessToken:     localStorage.getItem('accessToken') || null,
    isAuthenticated: false,
    isLoading:       false,
    isInitialized:   false,
    error:           null,
    // ✅ FIX 2: track if user just registered (needs email verify)
    justRegistered:  false,
  },
  reducers: {
    clearError:     (state) => { state.error = null; },
    setInitialized: (state) => { state.isInitialized = true; state.isAuthenticated = false; },
    clearJustRegistered: (state) => { state.justRegistered = false; },
  },
  extraReducers: (builder) => {

    // ── register ──────────────────────────────────────────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        // ✅ FIX 1: After register, store user data but do NOT set isAuthenticated = true
        // This prevents automatic redirect to /dashboard
        state.user            = action.payload.user;
        state.accessToken     = action.payload.accessToken;
        state.isAuthenticated = false;  // <-- stays false until email verified & login
        state.isInitialized   = true;
        state.justRegistered  = true;   // flag to show verification message
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── login ─────────────────────────────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading       = false;
        state.user            = action.payload.user;
        state.accessToken     = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized   = true;
        state.justRegistered  = false;
        toast.success(`Welcome back, ${action.payload.user.name}! 👋`);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // ── logout ────────────────────────────────────────────────────────────────
    builder.addCase(logout.fulfilled, (state) => {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
      state.justRegistered  = false;
    });

    // ── fetchMe ───────────────────────────────────────────────────────────────
    // ✅ FIX 3: fetchMe on page reload — only mark authenticated if server confirms user
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.isLoading       = false;
        state.user            = action.payload;
        state.isAuthenticated = true;  // server confirmed valid session
        state.isInitialized   = true;
        initSocket(state.accessToken);
      })
      .addCase(fetchMe.rejected, (state) => {
        // Token was invalid or expired — clear everything
        state.isLoading       = false;
        state.isAuthenticated = false;
        state.isInitialized   = true;
        state.accessToken     = null;
        state.user            = null;
        localStorage.removeItem('accessToken');
      });

    // ── updateProfile ─────────────────────────────────────────────────────────
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { clearError, setInitialized, clearJustRegistered } = authSlice.actions;
export default authSlice.reducer;
