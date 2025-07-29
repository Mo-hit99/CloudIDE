const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AuthAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/auth`;
  }

  // Get auth headers with token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Handle API responses
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/me`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await fetch(`${this.baseURL}/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Create container for user
  async createContainer() {
    try {
      const response = await fetch(`${this.baseURL}/create-container`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create container error:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      // Clear local storage regardless of response
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return await this.handleResponse(response);
    } catch (error) {
      // Clear local storage even if logout request fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }

    try {
      // Basic token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        // Token expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Refresh user data
  async refreshUser() {
    try {
      const response = await this.getProfile();
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  }

  // Validate token with server
  async validateToken() {
    try {
      const response = await this.getProfile();
      return response.user;
    } catch (error) {
      // Token is invalid, clear auth data
      this.clearAuth();
      throw error;
    }
  }
}

// Create and export singleton instance
export const authAPI = new AuthAPI();
export default authAPI;
