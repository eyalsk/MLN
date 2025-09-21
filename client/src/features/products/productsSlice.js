import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import appConfig from '../../config/appConfig';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (endpoint) => {
  const response = await axios.get(`${appConfig.apiBaseUrl}${endpoint}`);
  return response.data;
});

export const addProduct = createAsyncThunk('products/addProduct', async ({ categoryId, productName }) => {
  const response = await axios.post(`${appConfig.apiBaseUrl}/api/categories/${categoryId}/products`, { name: productName });
  return response.data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default productsSlice.reducer;
