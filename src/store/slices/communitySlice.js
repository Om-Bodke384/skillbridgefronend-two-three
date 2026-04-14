import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCommunities = createAsyncThunk('community/fetchAll', async (params) => {
  const res = await api.get('/communities', { params });
  return res.data.data;
});

export const fetchMyCommunities = createAsyncThunk('community/fetchMine', async () => {
  const res = await api.get('/communities/my');
  return res.data.data;
});

export const fetchCommunity = createAsyncThunk('community/fetchOne', async (id) => {
  const res = await api.get(`/communities/${id}`);
  return res.data.data;
});

export const createCommunity = createAsyncThunk('community/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/communities', data);
    toast.success('Community created!');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const joinCommunity = createAsyncThunk('community/join', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/communities/${id}/join`);
    toast.success('Joined community!');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const leaveCommunity = createAsyncThunk('community/leave', async (id) => {
  await api.post(`/communities/${id}/leave`);
  toast.success('Left community');
  return id;
});

const communitySlice = createSlice({
  name: 'community',
  initialState: {
    communities: [],
    myCommunities: [],
    activeCommunity: null,
    pagination: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    setActiveCommunity: (state, action) => { state.activeCommunity = action.payload; },
    clearActiveCommunity: (state) => { state.activeCommunity = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.pending,  (state) => { state.isLoading = true; })
      .addCase(fetchCommunities.fulfilled,(state, action) => {
        state.isLoading = false;
        state.communities = action.payload.communities;
        state.pagination = { total: action.payload.total, pages: action.payload.pages, page: action.payload.page };
      })
      .addCase(fetchCommunities.rejected, (state, action) => { state.isLoading = false; state.error = action.error.message; })
      .addCase(fetchMyCommunities.fulfilled, (state, action) => { state.myCommunities = action.payload; })
      .addCase(fetchCommunity.fulfilled,    (state, action) => { state.activeCommunity = action.payload; })
      .addCase(createCommunity.fulfilled,   (state, action) => { state.myCommunities.unshift(action.payload); })
      .addCase(joinCommunity.fulfilled,     (state, action) => { state.myCommunities.push(action.payload); })
      .addCase(leaveCommunity.fulfilled,    (state, action) => {
        state.myCommunities = state.myCommunities.filter((c) => c._id !== action.payload);
      });
  },
});

export const { setActiveCommunity, clearActiveCommunity } = communitySlice.actions;
export default communitySlice.reducer;
