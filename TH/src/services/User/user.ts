import axios from '@/utils/axios';

export interface UserProfile {
  _id: string;
  name?: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string; // Date of birth
  gender?: 'male' | 'female' | 'other';
  role: string;
  createdAt: string;
  updatedAt: string;
}

export async function registerUser(data: {
  name: string;
  username: string;
  password: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dob?: string;
}) {
  return axios('http://localhost:3456/user/auth/register', {
    method: 'POST',
    data,
  });
}

export async function loginUser(data: { username: string; password: string }) {
  return axios('http://localhost:3456/user/auth/login', {
    method: 'POST',
    data: {
      username: data.username,
      password: data.password,
    },
  });
}

export async function loginAdmin(data: { username: string; password: string }) {
  return axios('http://localhost:3456/admin/auth/login', {
    method: 'POST',
    data: {
      email: data.username, // Changed from phone to email
      password: data.password,
    },
  });
}

export async function getUserProfile(): Promise<{ data: UserProfile }> {
  return axios('http://localhost:3456/user/profile', {
    method: 'GET',
  });
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string; // Date of birth in YYYY-MM-DD format
  gender?: 'male' | 'female' | 'other';
}): Promise<{ data: UserProfile }> {
  return axios('http://localhost:3456/user/profile', {
    method: 'PUT',
    data,
  });
}

export async function logoutUser() {
  try {
    // Call API to invalidate token on server
    await axios('http://localhost:3456/user/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Log error but continue with local cleanup
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear local data regardless of API success/failure
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');

    // Redirect to login page
    window.location.href = '/auth/login';
  }

  return { success: true, message: 'Logged out successfully' };
}
