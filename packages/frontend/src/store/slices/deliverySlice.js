import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

//  Async thunks 

export const fetchDelivery = createAsyncThunk(
  'delivery/fetchByOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/delivery/order/${orderId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch delivery');
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateStatus',
  async ({ deliveryId, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/api/delivery/${deliveryId}/status`, { status });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────

const deliverySlice = createSlice({
  name: 'delivery',
  initialState: {
    current:    null,   // current delivery object
    loading:    false,
    error:      null,
  },
  reducers: {
    // Called by socket.io listener to update driver position in real-time
    setDriverLocation(state, action) {
      if (state.current) {
        state.current.driverLat = action.payload.lat;
        state.current.driverLng = action.payload.lng;
        state.current.locationUpdatedAt = action.payload.timestamp;
      }
    },
    clearDelivery(state) {
      state.current = null;
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDelivery.pending,  (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchDelivery.fulfilled,(state, action) => { state.loading = false; state.current = action.payload; })
      .addCase(fetchDelivery.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateDeliveryStatus.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(updateDeliveryStatus.rejected,  (state, action) => { state.error = action.payload; });
  },
});

export const { setDriverLocation, clearDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
