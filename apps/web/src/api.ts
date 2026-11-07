import axios from 'axios';

export type {
  ApiError,
  CategoryProductsResponse,
  EnquiryRequest,
  EnquiryResponse,
  Product,
  ProductRating,
} from '@product-catalogue/shared';

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? undefined : import.meta.env.VITE_API_URL,
});
