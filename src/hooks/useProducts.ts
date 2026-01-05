import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product, GetProductsParams } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Hook pour récupérer tous les produits
 */
export const useProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getProducts(params);
      if (response.success && response.data) {
        // Normaliser les produits pour avoir un id cohérent
        return response.data.products.map(p => ({
          ...p,
          id: p._id || p.id,
        }));
      }
      throw new Error(response.message || 'Erreur lors de la récupération des produits');
    },
    enabled: isSupabaseConfigured,
    initialData: [] as Product[],
  });
};

/**
 * Hook pour récupérer un produit par ID
 */
export const useProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const response = await productsApi.getProduct(productId);
      if (response.success && response.data) {
        return {
          ...response.data.product,
          id: response.data.product._id || response.data.product.id,
        };
      }
      throw new Error(response.message || 'Erreur lors de la récupération du produit');
    },
    enabled: !!productId && isSupabaseConfigured,
  });
};

/**
 * Hook pour créer un produit (Admin)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

/**
 * Hook pour modifier un produit (Admin)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      productsApi.updateProduct(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
};

/**
 * Hook pour supprimer un produit (Admin)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

