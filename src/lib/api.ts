/**
 * Service API pour communiquer avec Supabase
 */

import { getSupabaseClient, SUPABASE_STORAGE_BUCKET } from './supabase';

/**
 * Interface pour les réponses API (compatibilité avec l'ancien code)
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

/**
 * Interface pour un produit
 */
export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  image: string;
  imagePath?: string;
  category: 'homme' | 'femme' | 'mixte' | 'skincare';
  description: string;
  stock: number;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subcategory?: string;
  subSubcategory?: string;
}

/**
 * Interface pour un utilisateur
 */
export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role?: string;
}

const formatProduct = (record: any): Product => ({
  id: record.id,
  _id: record.id,
  name: record.name,
  description: record.description,
  price: record.price,
  category: record.category,
  stock: record.stock,
  isFeatured: record.is_featured ?? record.isFeatured ?? false,
  image: record.image_url || record.image || '',
  imagePath: record.image_url || record.image || '',
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  subcategory: record.subcategory,
  subSubcategory: record.sub_subcategory || record.subSubcategory,
});

const uploadProductImage = async (image?: File | null): Promise<string | null> => {
  if (!image) return null;
  const supabase = getSupabaseClient();

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${image.name}`;
  const { error } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(uniqueName, image, {
    cacheControl: '3600',
    upsert: false,
    contentType: image.type,
  });

  if (error) {
    throw new Error(`Échec de l'upload de l'image: ${error.message}`);
  }

  const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(uniqueName);
  return data.publicUrl;
};

const getCurrentUserId = async () => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Vous devez être connecté pour effectuer cette action.");
  }
  return data.user.id;
};

export const mapSupabaseUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Utilisateur',
  email: supabaseUser.email || '',
  isAdmin: Boolean(
    supabaseUser.app_metadata?.is_admin ||
    supabaseUser.user_metadata?.is_admin ||
    supabaseUser.user_metadata?.isAdmin
  ),
});

/**
 * ==================== AUTHENTIFICATION ====================
 */

export const authApi = {
  /**
   * Inscription via Supabase Auth
   */
  signup: async (name: string, email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          is_admin: false,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Impossible de créer l'utilisateur");
    }

    return {
      success: true,
      data: {
        user: mapSupabaseUser(data.user),
      },
    };
  },

  /**
   * Connexion
   */
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Utilisateur introuvable');
    }

    return {
      success: true,
      data: { user: mapSupabaseUser(data.user) },
    };
  },

  /**
   * Récupérer la session courante
   */
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error(error?.message || 'Utilisateur non connecté');
    }

    return {
      success: true,
      data: { user: mapSupabaseUser(data.user) },
    };
  },
};

/**
 * ==================== PRODUITS ====================
 */

export interface GetProductsParams {
  category?: 'homme' | 'femme' | 'mixte' | 'skincare';
  subcategory?: string;
  subSubcategory?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const productsApi = {
  /**
   * Récupérer tous les produits
   */
  getProducts: async (params?: GetProductsParams): Promise<ApiResponse<ProductsResponse>> => {
    const supabase = getSupabaseClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.subcategory) {
      query = query.eq('subcategory', params.subcategory);
    }
    if (params?.subSubcategory) {
      query = query.eq('sub_subcategory', params.subSubcategory);
    }
    if (params?.featured) {
      query = query.eq('is_featured', true);
    }
    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: {
        products: (data || []).map(formatProduct),
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: count ? Math.ceil(count / limit) : 1,
        },
      },
    };
  },

  /**
   * Récupérer un produit par ID
   */
  getProduct: async (productId: string): Promise<ApiResponse<{ product: Product }>> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { product: formatProduct(data) },
    };
  },

  /**
   * Créer un produit (Admin)
   */
  createProduct: async (productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: File;
    subcategory?: string;
    subSubcategory?: string;
  }): Promise<ApiResponse<{ product: Product }>> => {
    const supabase = getSupabaseClient();
    const imageUrl = await uploadProductImage(productData.image);

    const payload: Record<string, any> = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      image_url: imageUrl,
    };

    if (productData.subcategory) {
      payload.subcategory = productData.subcategory;
    }
    if (productData.subSubcategory) {
      payload.sub_subcategory = productData.subSubcategory;
    }

    const { data, error } = await supabase.from('products').insert(payload).select('*').single();
    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { product: formatProduct(data) },
    };
  },

  /**
   * Modifier un produit (Admin)
   */
  updateProduct: async (
    productId: string,
    productData: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      isFeatured: boolean;
      image: File;
      subcategory?: string;
      subSubcategory?: string;
    }>
  ): Promise<ApiResponse<{ product: Product }>> => {
    const supabase = getSupabaseClient();
    const updatePayload: Record<string, any> = {};
    if (productData.name !== undefined) updatePayload.name = productData.name;
    if (productData.description !== undefined) updatePayload.description = productData.description;
    if (productData.price !== undefined) updatePayload.price = productData.price;
    if (productData.category !== undefined) updatePayload.category = productData.category;
    if (productData.stock !== undefined) updatePayload.stock = productData.stock;
    if (productData.isFeatured !== undefined) updatePayload.is_featured = productData.isFeatured;
    if (productData.subcategory !== undefined) updatePayload.subcategory = productData.subcategory;
    if (productData.subSubcategory !== undefined) updatePayload.sub_subcategory = productData.subSubcategory;

    if (productData.image) {
      updatePayload.image_url = await uploadProductImage(productData.image);
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { product: formatProduct(data) },
    };
  },

  /**
   * Supprimer un produit (Admin)
   */
  deleteProduct: async (productId: string): Promise<ApiResponse<void>> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  },
};

/**
 * ==================== WISHLIST ====================
 */

export interface WishlistItem {
  _id: string;
  user: string;
  product: Product;
  createdAt: string;
}

export const wishlistApi = {
  /**
   * Récupérer la wishlist
   */
  getWishlist: async (): Promise<ApiResponse<{ wishlist: WishlistItem[]; count: number }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, created_at, product:products(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    const wishlist =
      data?.map((item: any) => ({
        _id: item.id,
        user: userId,
        createdAt: item.created_at,
        product: formatProduct(item.product),
      })) || [];

    return {
      success: true,
      data: { wishlist, count: wishlist.length },
    };
  },

  /**
   * Ajouter un produit à la wishlist
   */
  addToWishlist: async (productId: string): Promise<ApiResponse<{ wishlistItem: WishlistItem }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('wishlist')
      .insert({ user_id: userId, product_id: productId })
      .select('id, created_at, product:products(*)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const wishlistItem: WishlistItem = {
      _id: data.id,
      user: userId,
      createdAt: data.created_at,
      product: formatProduct(data.product),
    };

    return {
      success: true,
      data: { wishlistItem },
    };
  },

  /**
   * Retirer un produit de la wishlist
   */
  removeFromWishlist: async (productId: string): Promise<ApiResponse<void>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },

  /**
   * Vérifier si un produit est dans la wishlist
   */
  checkWishlist: async (productId: string): Promise<ApiResponse<{ isInWishlist: boolean }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { isInWishlist: Boolean(data) },
    };
  },
};

/**
 * ==================== ALERTES DE STOCK ====================
 */

export interface StockAlert {
  _id: string;
  user: string;
  product: Product;
  isNotified: boolean;
  createdAt: string;
}

export const stockAlertsApi = {
  /**
   * S'inscrire à une alerte de stock
   */
  subscribe: async (productId: string): Promise<ApiResponse<{ stockAlert: StockAlert }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('stock_alerts')
      .insert({ user_id: userId, product_id: productId })
      .select('id, created_at, is_notified, product:products(*)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: {
        stockAlert: {
          _id: data.id,
          user: userId,
          createdAt: data.created_at,
          isNotified: data.is_notified,
          product: formatProduct(data.product),
        },
      },
    };
  },

  /**
   * Se désinscrire d'une alerte
   */
  unsubscribe: async (productId: string): Promise<ApiResponse<void>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('stock_alerts')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },

  /**
   * Récupérer les alertes de l'utilisateur
   */
  getUserAlerts: async (): Promise<ApiResponse<{ stockAlerts: StockAlert[]; count: number }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('id, created_at, is_notified, product:products(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    const stockAlerts =
      data?.map((item: any) => ({
        _id: item.id,
        user: userId,
        createdAt: item.created_at,
        isNotified: item.is_notified,
        product: formatProduct(item.product),
      })) || [];

    return {
      success: true,
      data: { stockAlerts, count: stockAlerts.length },
    };
  },

  /**
   * Vérifier l'inscription à une alerte
   */
  checkAlert: async (productId: string): Promise<ApiResponse<{ isSubscribed: boolean }>> => {
    const supabase = getSupabaseClient();
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('stock_alerts')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { isSubscribed: Boolean(data) },
    };
  },
};

/**
 * Fonction utilitaire pour obtenir l'URL complète d'une image
 */
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    console.warn('[getImageUrl] Image path is empty');
    return '/placeholder.svg';
  }

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si c'est un chemin absolu qui commence par /, le retourner tel quel
  // (c'est le cas pour les images chargées via import.meta.glob)
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Sinon, ajouter le base URL si configuré
  const baseUrl = import.meta.env.VITE_PUBLIC_ASSET_BASE_URL || '';
  return baseUrl ? `${baseUrl}${imagePath}` : imagePath;
};

