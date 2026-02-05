// Author: Florian Rischer
// API Base URL - uses environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper to get image URL from slug
export const getImageUrl = (slug: string): string => {
  return `${API_BASE_URL}/images/${slug}`;
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

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

export default {
  projects: projectsAPI,
  skills: skillsAPI,
  messages: messagesAPI,
  images: imagesAPI,
};
