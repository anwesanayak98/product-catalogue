import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/productService';

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => {
      if (!id) {
        throw new Error('A product ID is required.');
      }

      return getProductById(id);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
