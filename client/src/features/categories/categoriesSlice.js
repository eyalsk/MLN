import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import appConfig from '../../config/appConfig';

export const fetchCategories = createAsyncThunk('categories/fetchCategories', async () => {
  const response = await axios.get(`${appConfig.apiBaseUrl}/api/categories`);
  return response.data;
});

export const addCategory = createAsyncThunk('categories/addCategory', async (categoryName) => {
  const response = await axios.post(`${appConfig.apiBaseUrl}/api/categories`, { name: categoryName });
  return response.data;
});

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [], status: 'idle', fetched: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.fetched = true;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default categoriesSlice.reducer;
