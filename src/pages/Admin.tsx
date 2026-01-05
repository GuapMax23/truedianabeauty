import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Edit, Plus } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { 
  getSkincareSubcategories, 
  getSkincareSubSubcategories,
  type SkincareSubcategory,
  type SkincareSubSubcategory 
} from '@/data/skincareCatalog';

const Admin = () => {
  const { isAuthenticated, isAdmin, isAuthEnabled } = useAuth();
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'homme',
    stock: '',
    image: null as File | null,
    subcategory: '' as string,
    subSubcategory: '' as string,
  });

  useEffect(() => {
    if (!isAuthEnabled) return;
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isAuthEnabled, navigate]);

  if (!isAuthEnabled) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="max-w-xl text-center px-4">
            <h1 className="font-display text-4xl font-bold text-gold mb-4">Back-office désactivé</h1>
            <p className="text-muted-foreground">
              Le mode vitrine ne propose pas encore de gestion de stock. Activez Supabase pour retrouver
              l&apos;interface d&apos;administration complète.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image && !editingProduct) {
      toast({
        title: 'Erreur',
        description: 'Une image est requise',
        variant: 'destructive',
      });
      return;
    }

    try {
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
      };

      // Ajouter les sous-catégories si c'est un produit skincare
      if (formData.category === 'skincare') {
        if (formData.subcategory) {
          productData.subcategory = formData.subcategory;
        }
        if (formData.subSubcategory) {
          productData.subSubcategory = formData.subSubcategory;
        }
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct._id || editingProduct.id,
          data: {
            ...productData,
            ...(formData.image && { image: formData.image }),
          },
        });
        toast({
          title: 'Succès',
          description: 'Produit modifié avec succès',
        });
      } else {
        await createProduct.mutateAsync({
          ...productData,
          image: formData.image!,
        });
        toast({
          title: 'Succès',
          description: 'Produit créé avec succès',
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'homme',
      stock: '',
      image: null,
      subcategory: '',
      subSubcategory: '',
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: null,
      subcategory: product.subcategory || '',
      subSubcategory: product.subSubcategory || product.sub_subcategory || '',
    });
    setIsDialogOpen(true);
  };

  const skincareSubcategories = getSkincareSubcategories();
  const availableSubSubcategories = useMemo(() => {
    if (formData.category === 'skincare' && formData.subcategory) {
      return getSkincareSubSubcategories(formData.subcategory as SkincareSubcategory);
    }
    return [];
  }, [formData.category, formData.subcategory]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await deleteProduct.mutateAsync(productId);
      toast({
        title: 'Succès',
        description: 'Produit supprimé avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
                Administration
              </h1>
              <p className="text-muted-foreground">
                Gérer les produits de Diana Beauty
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-gold hover:bg-gold-light text-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix (FCFA)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        category: e.target.value,
                        subcategory: '', // Reset subcategory when changing category
                        subSubcategory: '', // Reset subSubcategory when changing category
                      })}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="mixte">Mixte</option>
                      <option value="skincare">Skincare</option>
                    </select>
                  </div>

                  {/* Sous-catégories pour skincare */}
                  {formData.category === 'skincare' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Sous-catégorie</Label>
                        <select
                          id="subcategory"
                          value={formData.subcategory}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            subcategory: e.target.value,
                            subSubcategory: '', // Reset subSubcategory when changing subcategory
                          })}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                          <option value="">Sélectionner une sous-catégorie</option>
                          {skincareSubcategories.map((subcat) => (
                            <option key={subcat} value={subcat}>
                              {subcat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sous-sous-catégories pour skincare */}
                      {formData.subcategory && availableSubSubcategories.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="subSubcategory">Sous-sous-catégorie</Label>
                          <select
                            id="subSubcategory"
                            value={formData.subSubcategory}
                            onChange={(e) => setFormData({ ...formData, subSubcategory: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          >
                            <option value="">Sélectionner une sous-sous-catégorie</option>
                            {availableSubSubcategories.map((subSubcat) => (
                              <option key={subSubcat} value={subSubcat}>
                                {subSubcat}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="image">Image {editingProduct && '(optionnel)'}</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                      required={!editingProduct}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-gold hover:bg-gold-light text-primary"
                      disabled={createProduct.isPending || updateProduct.isPending}
                    >
                      {editingProduct ? 'Modifier' : 'Créer'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement des produits...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <div
                  key={product._id || product.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-display font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">{product.price.toLocaleString()} FCFA</span>
                    <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product._id || product.id)}
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;

