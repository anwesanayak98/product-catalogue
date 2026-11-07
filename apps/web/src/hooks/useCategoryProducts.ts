import { useQuery } from '@tanstack/react-query';
import { getCategoryProducts } from '../services/productService';

export function useCategoryProducts(category: string | undefined) {
  return useQuery({
    queryKey: ['categories', category, 'products'],
    queryFn: () => {
      if (!category) {
        throw new Error('A category is required.');
      }

      return getCategoryProducts(category);
    },
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  });
}
