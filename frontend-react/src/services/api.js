import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Article API Service
 */
export const articleService = {
  /**
   * Get all articles with optional filtering
   */
  getArticles: async (type = null, page = 1, perPage = 15) => {
    try {
      const params = { page, per_page: perPage };
      if (type) {
        params.type = type;
      }
      const response = await apiClient.get('/articles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  /**
   * Get single article by ID
   */
  getArticleById: async (id) => {
    try {
      const response = await apiClient.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  /**
   * Create new article
   */
  createArticle: async (articleData) => {
    try {
      const response = await apiClient.post('/articles', articleData);
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  },

  /**
   * Update article
   */
  updateArticle: async (id, articleData) => {
    try {
      const response = await apiClient.put(`/articles/${id}`, articleData);
      return response.data;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },

  /**
   * Delete article
   */
  deleteArticle: async (id) => {
    try {
      const response = await apiClient.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  },

  /**
   * Search articles
   */
  searchArticles: async (query, type = null) => {
    try {
      const params = { q: query };
      if (type) {
        params.type = type;
      }
      const response = await apiClient.get('/articles/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  },

  /**
   * Trigger scraping
   */
  scrapeArticles: async () => {
    try {
      const response = await apiClient.post('/articles/scrape');
      return response.data;
    } catch (error) {
      console.error('Error triggering scrape:', error);
      throw error;
    }
  }
};

export default apiClient;
