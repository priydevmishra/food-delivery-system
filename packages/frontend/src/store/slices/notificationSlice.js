import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/notifications/${userId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list:    [],
    loading: false,
    error:   null,
  },
  reducers: {
    // Push a new notification in real-time (from polling or push)
    addNotification(state, action) {
      state.list.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchNotifications.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.list.findIndex(n => n.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
