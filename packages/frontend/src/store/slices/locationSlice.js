import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

export const fetchCurrentLocation = createAsyncThunk(
  'location/fetchCurrent',
  async (deliveryId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/location/${deliveryId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Location not found');
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    current:    null,   // { deliveryId, lat, lng, updatedAt }
    history:    [],     // array of { lat, lng, time }
    loading:    false,
    error:      null,
    isTracking: false,
  },
  reducers: {
    // Real-time update received from socket.io
    liveLocationReceived(state, action) {
      state.current    = action.payload;
      state.isTracking = true;
      // Keep local history in store too (last 20 points)
      state.history = [action.payload, ...state.history].slice(0, 20);
    },
    stopTracking(state) {
      state.isTracking = false;
    },
    clearLocation(state) {
      state.current    = null;
      state.history    = [];
      state.isTracking = false;
      state.error      = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentLocation.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCurrentLocation.fulfilled, (state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchCurrentLocation.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { liveLocationReceived, stopTracking, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
