/**
 * Service Slice - 管理服务相关状态
 */
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceApi, CreateServicePayload, UpdateServicePayload } from '../services/serviceApi';
import { Service, ServiceQuery } from '../types';

/**
 * 服务列表响应接口
 */
export interface ServicesResponse {
  items: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 服务状态类型定义
 */
export interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

/**
 * 初始状态
 */
const initialState: ServiceState = {
  services: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  creating: false,
  updating: false,
  deleting: false,
};

/**
 * 获取服务列表异步操作 - for Customers
 */
export const fetchServicesForUsers = createAsyncThunk(
  'service/fetchServicesForUsers',
  async (query?: ServiceQuery) => {
    const response = await serviceApi.getServicesForCustomers(query || {});
    return response;
  }
);

/**
 * 获取服务列表异步操作 - for Customers
 */
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (query?: ServiceQuery) => {
    const response = await serviceApi.getServices(query || {});
    return response;
  }
);

/**
 * 创建服务异步操作
 */
export const createService = createAsyncThunk(
  'service/createService',
  async (payload: CreateServicePayload) => {
    const response = await serviceApi.createService(payload);
    return response;
  }
);

/**
 * 更新服务异步操作
 */
export const updateService = createAsyncThunk(
  'service/updateService',
  async ({ id, payload }: { id: string; payload: UpdateServicePayload }) => {
    const response = await serviceApi.updateService(id, payload);
    return response;
  }
);

/**
 * 切换服务状态异步操作
 */
export const toggleServiceStatus = createAsyncThunk(
  'service/toggleServiceStatus',
  async ({ id, isActive }: { id: string; isActive: boolean }) => {
    const response = await serviceApi.toggleServiceStatus(id, isActive);
    return response;
  }
);

/**
 * Service Slice
 */
const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    /**
     * 清除错误
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * 设置分页
     */
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    /**
     * 设置每页数量
     */
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesForUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicesForUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServicesForUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取服务列表失败';
      });
    // 获取服务列表
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        state.services = data.items;
        state.pagination = {
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages
        };
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取服务列表失败';
      });

    // 创建服务
    builder
      .addCase(createService.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.creating = false;
        state.services.unshift(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || '创建服务失败';
      });

    // 更新服务
    builder
      .addCase(updateService.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || '更新服务失败';
      });

    // 切换服务状态
    builder
      .addCase(toggleServiceStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(toggleServiceStatus.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index].isActive = action.payload.isActive;
        }
      })
      .addCase(toggleServiceStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.error.message || '切换服务状态失败';
      });
  },
});

export const { clearError, setPage, setLimit } = serviceSlice.actions;
export default serviceSlice.reducer;
