import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import appConfig from "../../config/appConfig";

export const submitOrder = createAsyncThunk(
  "order/submitOrder",
  async (orderDetails, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${appConfig.apiBaseUrl}/api/orders`,
        orderDetails
      );
      if (response.status === 201 && response.data.order) {
        return response.data;
      } else {
        return rejectWithValue("Invalid response format");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Network error");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: { details: null, status: "idle", error: null },
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.details = action.payload;
        state.error = null;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "An error occurred";
        console.error(
          "Order submission failed:",
          action.payload || "An error occurred"
        );
      });
  },
});

export const { clearError } = orderSlice.actions;

export default orderSlice.reducer;
