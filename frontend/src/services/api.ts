// Author: Florian Rischer
// API Base URL - in production, this would come from environment variables
const API_BASE_URL = 'http://localhost:3001/api';

// Token key for localStorage
const TOKEN_KEY = 'portfolio_jwt_token';

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Helper to get image URL from slug
export const getImageUrl = (slug: string): string => {
  return `${API_BASE_URL}/images/${slug}`;
};

// Generic fetch wrapper with error handling and JWT support
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = true
): Promise<{ success: boolean; data?: T; error?: string; status?: number }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge custom headers from options
    if (options.headers) {
      const customHeaders = options.headers as Record<string, string>;
      Object.assign(headers, customHeaders);
    }

    // Add Authorization header if token exists and auth is required
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Clear stored auth data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('portfolio_user');
      
      // Redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      return {
        success: false,
        error: 'Session expired. Please log in again.',
        status: 401,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP error! status: ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data: result.data,
      status: response.status,
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Types
export interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: 'ux-design' | 'ui-design' | 'branding' | 'web-development';
  technologies: string[];
  thumbnailUrl: string;
  images: string[];
  screens: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
}

export interface Skill {
  _id: string;
  name: string;
  icon: string;
  category: 'design' | 'development' | 'tools';
  proficiency: number;
  order: number;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Projects API
export const projectsAPI = {
  getAll: (params?: { category?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.featured) query.append('featured', 'true');
    const queryString = query.toString();
    return fetchAPI<Project[]>(`/projects${queryString ? `?${queryString}` : ''}`);
  },

  getBySlug: (slug: string) => {
    return fetchAPI<Project>(`/projects/${slug}`);
  },

  getById: (id: string) => {
    return fetchAPI<Project>(`/projects/${id}`);
  },
};

// Skills API
export const skillsAPI = {
  getAll: (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return fetchAPI<Skill[]>(`/skills${query}`);
  },
};

// Messages API (Contact Form)
export const messagesAPI = {
  send: (data: ContactFormData) => {
    return fetchAPI<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Images API
export interface ImageMetadata {
  _id: string;
  name: string;
  slug: string;
  category: 'project' | 'skill' | 'general' | 'icon';
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export const imagesAPI = {
  // Get all images metadata
  getAll: (category?: string) => {
    const query = category ? `?category=${category}` : '';
    return fetchAPI<ImageMetadata[]>(`/images${query}`);
  },

  // Get image metadata by slug
  getMetadata: (slug: string) => {
    return fetchAPI<ImageMetadata>(`/images/${slug}/metadata`);
  },

  // Get image URL (for use in img src)
  getUrl: (slug: string): string => {
    return `${API_BASE_URL}/images/${slug}`;
  },
};

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

// Auth API
export const authAPI = {
  // Login - get JWT token
  login: (email: string, password: string) => {
    return fetchAPI<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
  },

  // Signup - create new user
  signup: (data: SignupData) => {
    return fetchAPI<LoginResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  // Verify - check if token is valid
  verify: (token: string) => {
    return fetchAPI<AuthUser>('/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, false);
  },
};

export default {
  projects: projectsAPI,
  skills: skillsAPI,
  messages: messagesAPI,
  images: imagesAPI,
  auth: authAPI,
};
