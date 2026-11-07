import { useQuery } from '@tanstack/react-query';
import { getFeaturedProducts } from '../services/productService';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: getFeaturedProducts,
    staleTime: 5 * 60 * 1000,
  });
}
