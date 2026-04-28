import { Effect, Reducer } from 'umi';
import { loginUser, registerUser, loginAdmin } from '@/services/User/user';

export interface UserModelState {
  currentUser?: any;
  token?: string;
  role?: string;
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    login: Effect;
    loginUnified: Effect;
    register: Effect;
    logout: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    saveToken: Reducer<UserModelState>;
    saveRole: Reducer<UserModelState>;
    clearUser: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',
  state: {
    currentUser: undefined,
    token: undefined,
    role: undefined,
  },
  effects: {
    *login({ payload }, { call, put }): Generator<any, any, any> {
      const response = yield call(loginUser, payload);
      if (response?.data.data) {
        localStorage.setItem('token', response.data.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        yield put({
          type: 'saveCurrentUser',
          payload: response.data.data.user,
        });
        yield put({
          type: 'saveToken',
          payload: response.data.data.access_token,
        });
      }
      return response;
    },

    *loginUnified({ payload }, { call, put }): Generator<any, any, any> {
  // Thử đăng nhập với tư cách admin trước
  try {
    const adminResponse = yield call(loginAdmin, payload);

    // Kiểm tra dữ liệu response chính xác
    if (adminResponse?.data?.data.access_token) {
      console.log('Admin login response:', adminResponse.data.data);

      // Lưu token và thông tin người dùng
      localStorage.setItem('token', adminResponse.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(adminResponse.data.data.user || {}));
      localStorage.setItem('role', 'admin');

      // Cập nhật state trong store
      yield put({
        type: 'saveCurrentUser',
        payload: adminResponse.data.data.user || {},
      });
      yield put({
        type: 'saveToken',
        payload: adminResponse.data.data.access_token,
      });
      yield put({
        type: 'saveRole',
        payload: 'admin',
      });

      return { ...adminResponse.data.data, role: 'admin' };
    }
  } catch (error: any) {
    console.log('Admin login error:', error?.response?.data.data || error.message);
  }

  // Thử đăng nhập với tư cách user thường
  try {
    const userResponse = yield call(loginUser, payload);

    // Kiểm tra dữ liệu response chính xác
    if (userResponse?.data?.data.access_token) {
      console.log('User login response:', userResponse.data.data);

      // Lưu token và thông tin người dùng
      localStorage.setItem('token', userResponse.data.data.access_token);
      localStorage.setItem('user', JSON.stringify(userResponse.data.data.user || {}));
      localStorage.setItem('role', 'user');

      // Cập nhật state trong store
      yield put({
        type: 'saveCurrentUser',
        payload: userResponse.data.data.user || {},
      });
      yield put({
        type: 'saveToken',
        payload: userResponse.data.data.access_token,
      });
      yield put({
        type: 'saveRole',
        payload: 'user',
      });

      return { ...userResponse.data.data, role: 'user' };
    }
  } catch (error: any) {
    console.log('User login error:', error?.response?.data.data || error.message);
  }

  // Nếu cả hai đều thất bại, ném lỗi
  throw new Error('Tài khoản hoặc mật khẩu không đúng!');
},

    *register({ payload }, { call }): Generator<any, any, any> {
      const response = yield call(registerUser, payload);
      return response;
    },

    *logout(_, { put }): Generator<any, any, any> {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      yield put({
        type: 'clearUser',
      });
    },
  },
  reducers: {
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: payload,
      };
    },
    saveToken(state, { payload }) {
      return {
        ...state,
        token: payload,
      };
    },
    saveRole(state, { payload }) {
      return {
        ...state,
        role: payload,
      };
    },
    clearUser(state) {
      return {
        ...state,
        currentUser: undefined,
        token: undefined,
        role: undefined,
      };
    },
  },
};

export default UserModel;
