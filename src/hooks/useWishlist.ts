import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * Hook pour récupérer la wishlist
 */
export const useWishlist = (enabled: boolean = true) => {
  const canFetch = enabled && isSupabaseConfigured;
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];
      const response = await wishlistApi.getWishlist();
      if (response.success && response.data) {
        return response.data.wishlist.map(item => ({
          ...item.product,
          id: item.product._id || item.product.id,
        }));
      }
      return [];
    },
    enabled: canFetch, // Ne pas faire de requête si l'utilisateur n'est pas connecté ou si Supabase est désactivé
    initialData: [] as any[],
    retry: false, // Ne pas réessayer si l'utilisateur n'est pas connecté
  });
};

/**
 * Hook pour vérifier si un produit est dans la wishlist
 */
export const useCheckWishlist = (productId: string | undefined) => {
  const canFetch = Boolean(productId && isSupabaseConfigured);
  return useQuery({
    queryKey: ['wishlist-check', productId],
    queryFn: async () => {
      if (!productId) return false;
      if (!isSupabaseConfigured) return false;
      const response = await wishlistApi.checkWishlist(productId);
      return response.success && response.data ? response.data.isInWishlist : false;
    },
    enabled: canFetch,
    retry: false,
  });
};

/**
 * Hook pour ajouter un produit à la wishlist
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Les favoris sont désactivés sur cette version vitrine.');
      }
      return wishlistApi.addToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check'] });
    },
  });
};

/**
 * Hook pour retirer un produit de la wishlist
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Les favoris sont désactivés sur cette version vitrine.');
      }
      return wishlistApi.removeFromWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check'] });
    },
  });
};

