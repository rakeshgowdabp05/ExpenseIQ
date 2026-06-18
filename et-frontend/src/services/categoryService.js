import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function getCategoryPath(publicId) {
  return `${apiEndpoints.categories}/${encodeURIComponent(
    publicId,
  )}`;
}

export const categoryService = Object.freeze({
  async getCategories(categoryType, active) {
    const parameters = {};

    if (categoryType) {
      parameters.type = categoryType;
    }

    if (typeof active === "boolean") {
      parameters.active = active;
    }

    const response = await apiClient.get(
      apiEndpoints.categories,
      {
        params: parameters,
      },
    );

    return response.data.data;
  },

  async getCategory(publicId) {
    const response = await apiClient.get(
      getCategoryPath(publicId),
    );

    return response.data.data;
  },

  async createCategory(categoryData) {
    const response = await apiClient.post(
      apiEndpoints.categories,
      categoryData,
    );

    return response.data;
  },

  async updateCategory(
    publicId,
    categoryData,
  ) {
    const response = await apiClient.put(
      getCategoryPath(publicId),
      categoryData,
    );

    return response.data;
  },

  async updateCategoryStatus(
    publicId,
    active,
  ) {
    const response = await apiClient.patch(
      `${getCategoryPath(publicId)}/status`,
      {
        active,
      },
    );

    return response.data;
  },

  async archiveCategory(publicId) {
    const response = await apiClient.delete(
      getCategoryPath(publicId),
    );

    return response.data;
  },
});