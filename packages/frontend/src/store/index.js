import { configureStore } from '@reduxjs/toolkit';

//  Your slices 
import deliveryReducer      from './slices/deliverySlice';
import locationReducer      from './slices/locationSlice';
import notificationReducer  from './slices/notificationSlice';

//  Partner slices (they add their imports here when merging) 
// import authReducer   from './slices/authSlice';    // ← partner adds this
// import orderReducer  from './slices/orderSlice';   // ← partner adds this

const store = configureStore({
  reducer: {
    // Your reducers
    delivery:      deliveryReducer,
    location:      locationReducer,
    notifications: notificationReducer,

    // Partner reducers — partner adds these lines when merging
    // auth:   authReducer,
    // orders: orderReducer,
  },
});

export default store;
