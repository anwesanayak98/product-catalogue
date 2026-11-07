import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/productService';

export function useProductSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ['products', 'search', normalizedQuery],
    queryFn: () => searchProducts(normalizedQuery),
    enabled: normalizedQuery.length > 0,
    staleTime: 60 * 1000,
  });
}
