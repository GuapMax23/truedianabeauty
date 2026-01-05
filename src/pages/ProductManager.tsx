import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Search,
  Edit,
  Save,
  X,
  Download,
  Upload,
  PlusCircle,
  Trash2,
  Layers,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllBaseProducts } from '@/data/localCatalog';
import type { Product } from '@/contexts/CartContext';
import {
  productData as localProductData,
  type CategoryConfig,
  type CustomProductRecord,
  type ProductDataFile,
  LOCAL_OVERRIDES_STORAGE_KEY,
  loadOverridesFromStorage,
} from '@/data/products';

const STORAGE_KEY = LOCAL_OVERRIDES_STORAGE_KEY;
const DEFAULT_OVERRIDES: ProductDataFile = {
  categories: [],
  customProducts: [],
  hiddenProductIds: [],
};

const loadOverrides = (): ProductDataFile => {
  const stored = loadOverridesFromStorage();
  if (!stored) return DEFAULT_OVERRIDES;
  return {
    categories: Array.isArray(stored.categories) ? stored.categories : [],
    customProducts: Array.isArray(stored.customProducts) ? stored.customProducts : [],
    hiddenProductIds: [],
  };
};

const mergeWithBaseData = (overrides: ProductDataFile): ProductDataFile => {
  const categoriesMap = new Map<string, CategoryConfig>();
  localProductData.categories.forEach(cat => categoriesMap.set(cat.id, cat));
  overrides.categories.forEach(cat => categoriesMap.set(cat.id, cat));

  return {
    categories: Array.from(categoriesMap.values()),
    customProducts: overrides.customProducts,
    hiddenProductIds: [],
  };
};

const slugify = (value: string) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'produit';

const generateProductId = (category: string, name: string) =>
  `${category || 'custom'}-${slugify(name)}-${Date.now().toString(36)}`;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Impossible de lire l'image ${file.name}`));
    reader.readAsDataURL(file);
  });

interface ManagedProduct extends Product { }

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'homme', label: 'Parfums Homme', isDefault: true },
  { id: 'femme', label: 'Parfums Femme', isDefault: true },
  { id: 'mixte', label: 'Parfums Mixte', isDefault: true },
  { id: 'skincare', label: 'Skincare', isDefault: true },
];

const ProductManager = () => {
  const { isAuthenticated, isAdmin, isAuthEnabled } = useAuth();
  const navigate = useNavigate();
  const baseCatalog = useMemo(() => getAllBaseProducts(), []);

  const [overrides, setOverrides] = useState<ProductDataFile>(() => loadOverrides());
  const [productDataState, setProductDataState] = useState<ProductDataFile>(() =>
    mergeWithBaseData(loadOverrides())
  );
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', price: '', description: '', category: 'homme' });
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const [editingCustomProduct, setEditingCustomProduct] = useState<CustomProductRecord | null>(null);
  const [customEditForm, setCustomEditForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'homme',
    coverImage: '',
  });
  const [customImagesToRemove, setCustomImagesToRemove] = useState<string[]>([]);
  const [customNewImages, setCustomNewImages] = useState<File[]>([]);
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ id: '', label: '', description: '' });
  const [categoryEdits, setCategoryEdits] = useState<Record<string, { label: string; description?: string }>>({});

  const persistOverrides = (nextOverrides: ProductDataFile) => {
    setOverrides(nextOverrides);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOverrides));
    }
  };

  useEffect(() => {
    setIsLoadingData(true);
    setProductDataState(mergeWithBaseData(overrides));
    setIsLoadingData(false);
  }, [overrides]);

  useEffect(() => {
    if (isAuthEnabled && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isAuthEnabled, navigate]);

  if (isAuthEnabled && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  const categories = productDataState?.categories?.length ? productDataState.categories : DEFAULT_CATEGORIES;
  const customRecords = productDataState?.customProducts ?? [];

  const managedProducts: ManagedProduct[] = useMemo(() => {
    const customProducts: ManagedProduct[] = customRecords.map(record => ({
      id: record.id,
      name: record.name,
      price: record.price,
      description: record.description,
      category: record.category,
      image: record.coverImage,
      gallery: record.gallery,
      isCustom: true,
    }));

    const baseProducts: ManagedProduct[] = baseCatalog.map(product => ({
      ...product,
      isCustom: false,
    }));

    return [...customProducts, ...baseProducts];
  }, [customRecords, baseCatalog]);

  const filteredProducts = useMemo(() => {
    let data = managedProducts;
    if (selectedCategory !== 'all') {
      data = data.filter(product => product.category === selectedCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term)
      );
    }
    return data;
  }, [managedProducts, selectedCategory, searchTerm]);

  const handleExport = () => {
    const data = filteredProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
      isCustom: p.isCustom,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produits-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export réussi',
      description: `${filteredProducts.length} produits exportés.`,
    });
  };

  const handleEdit = (product: ManagedProduct) => {
    if (product.isCustom) {
      const record = customRecords.find(item => item.id === product.id);
      if (!record) return;
      setEditingCustomProduct(record);
      setCustomEditForm({
        name: record.name,
        price: record.price.toString(),
        description: record.description,
        category: record.category,
        coverImage: record.coverImage,
      });
      setCustomImagesToRemove([]);
      setCustomNewImages([]);
      return;
    }

    setEditingProduct(product);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
    });
    setHasChanges(false);
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-product-override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editForm.name,
          price: editForm.price,
          description: editForm.description,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      toast({
        title: 'Succès',
        description: 'Produit mis à jour. La page va se recharger...',
      });

      // Recharger pour que les nouveaux overrides soient pris en compte (re-import de overrides.ts)
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!createForm.name || !createForm.price || !createImages.length) {
      toast({
        title: 'Champs requis',
        description: 'Nom, prix et au moins une image sont nécessaires',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const imagesData = await Promise.all(createImages.map(fileToDataUrl));
      if (!imagesData.length) {
        throw new Error('Ajoutez au moins une image');
      }

      const now = new Date().toISOString();
      const newRecord: CustomProductRecord = {
        id: generateProductId(createForm.category, createForm.name),
        name: createForm.name.trim(),
        price: Number(createForm.price),
        description: createForm.description.trim(),
        category: createForm.category,
        coverImage: imagesData[0],
        gallery: imagesData.slice(1),
        createdAt: now,
        updatedAt: now,
      };

      persistOverrides({
        ...overrides,
        customProducts: [...overrides.customProducts, newRecord],
      });

      toast({
        title: 'Produit créé',
        description: 'Le produit a été ajouté à votre catalogue',
      });

      setCreateForm({ name: '', price: '', description: '', category: createForm.category });
      setCreateImages([]);
      setShowCreateDialog(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le produit',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveCustomProduct = async () => {
    if (!editingCustomProduct) return;

    setIsSavingCustom(true);
    try {
      const imagesToRemove = new Set(customImagesToRemove);
      let gallery = editingCustomProduct.gallery.filter(img => !imagesToRemove.has(img));
      let cover = customEditForm.coverImage;

      if (imagesToRemove.has(cover)) {
        cover = gallery[0] || '';
      }

      const newImagesData = await Promise.all(customNewImages.map(fileToDataUrl));
      if (!cover && newImagesData.length) {
        cover = newImagesData[0];
        gallery = [...newImagesData.slice(1), ...gallery];
      } else {
        gallery = [...gallery, ...newImagesData.filter(img => img !== cover)];
      }

      if (!cover) {
        throw new Error('Le produit doit contenir au moins une image');
      }

      gallery = gallery.filter(img => img !== cover);

      const updatedRecord: CustomProductRecord = {
        ...editingCustomProduct,
        name: customEditForm.name.trim(),
        price: Number(customEditForm.price),
        description: customEditForm.description.trim(),
        category: customEditForm.category,
        coverImage: cover,
        gallery,
        updatedAt: new Date().toISOString(),
      };

      persistOverrides({
        ...overrides,
        customProducts: overrides.customProducts.map(product =>
          product.id === updatedRecord.id ? updatedRecord : product
        ),
      });

      toast({
        title: 'Produit mis à jour',
        description: 'Les informations ont été sauvegardées',
      });

      setEditingCustomProduct(null);
      setCustomImagesToRemove([]);
      setCustomNewImages([]);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le produit',
        variant: 'destructive',
      });
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleDeleteCustomProduct = (productId: string) => {
    if (!window.confirm('Supprimer définitivement ce produit ?')) return;

    try {
      if (!overrides.customProducts.some(product => product.id === productId)) {
        toast({
          title: 'Produit protégé',
          description: 'Seuls les produits ajoutés via ce formulaire peuvent être supprimés ici.',
        });
        return;
      }

      persistOverrides({
        ...overrides,
        customProducts: overrides.customProducts.filter(product => product.id !== productId),
      });
      toast({ title: 'Produit supprimé', description: 'Le produit a été retiré du site' });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer le produit',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.id || !newCategory.label) {
      toast({
        title: 'Champs requis',
        description: 'ID et nom sont nécessaires',
        variant: 'destructive',
      });
      return;
    }

    const exists =
      localProductData.categories.some(cat => cat.id === newCategory.id) ||
      overrides.categories.some(cat => cat.id === newCategory.id);

    if (exists) {
      toast({
        title: 'Doublon',
        description: 'Une catégorie avec cet ID existe déjà.',
        variant: 'destructive',
      });
      return;
    }

    persistOverrides({
      ...overrides,
      categories: [...overrides.categories, { ...newCategory, isDefault: false }],
    });

    toast({ title: 'Catégorie ajoutée', description: 'Elle est maintenant disponible.' });
    setNewCategory({ id: '', label: '', description: '' });
  };

  const handleUpdateCategory = (category: CategoryConfig) => {
    const payload = categoryEdits[category.id];
    if (!payload) return;

    const baseCategory = localProductData.categories.find(cat => cat.id === category.id);
    const updatedCategory: CategoryConfig = {
      id: category.id,
      label: payload.label,
      description: payload.description ?? '',
      isDefault: baseCategory?.isDefault ?? category.isDefault,
    };

    const existingIndex = overrides.categories.findIndex(cat => cat.id === category.id);
    const nextCategories =
      existingIndex >= 0
        ? overrides.categories.map(cat => (cat.id === category.id ? updatedCategory : cat))
        : [...overrides.categories, updatedCategory];

    persistOverrides({ ...overrides, categories: nextCategories });

    setCategoryEdits(prev => {
      const copy = { ...prev };
      delete copy[category.id];
      return copy;
    });

    toast({ title: 'Catégorie mise à jour', description: 'Les changements ont été appliqués.' });
  };

  const handleDeleteCategory = (category: CategoryConfig) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;

    if (localProductData.categories.some(cat => cat.id === category.id && cat.isDefault)) {
      toast({
        title: 'Action interdite',
        description: 'Impossible de supprimer une catégorie par défaut.',
        variant: 'destructive',
      });
      return;
    }

    persistOverrides({
      ...overrides,
      categories: overrides.categories.filter(cat => cat.id !== category.id),
      customProducts: overrides.customProducts.filter(product => product.category !== category.id),
    });

    toast({ title: 'Catégorie supprimée', description: 'Elle n\'apparaîtra plus dans la liste.' });
  };

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.label })),
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
                Gestion des Produits
              </h1>
              <p className="text-muted-foreground">Ajoutez, cachez ou éditez vos produits en temps réel</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowCategoriesDialog(true)} variant="outline">
                <Layers className="w-4 h-4 mr-2" />
                Catégories
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom, description ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-border rounded-md bg-background min-w-[200px]"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button onClick={handleExport} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter ({filteredProducts.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6 text-sm text-muted-foreground flex flex-wrap gap-3">
            <span>{filteredProducts.length} produit(s) trouvés</span>
            {isLoadingData && <span className="text-gold">Mise à jour des données…</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    {product.isCustom && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-burgundy text-white text-xs px-2 py-1 rounded">Custom</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gold">
                      {product.price > 0 ? `${product.price.toLocaleString()} FCFA` : 'Prix non défini'}
                    </span>
                    <span className="text-muted-foreground">{product.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleEdit(product)} size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => handleDeleteCustomProduct(product.id)}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      disabled={!product.isCustom}
                      title={
                        product.isCustom
                          ? 'Supprimer ce produit'
                          : 'Seuls les produits ajoutés peuvent être supprimés depuis cette interface'
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogue d'édition produit catalogue */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier les détails du produit</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={editingProduct.image}
                  alt={editingProduct.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1 text-sm text-muted-foreground">
                  <p className="mb-1">ID : {editingProduct.id}</p>
                  <p className="mb-1">Catégorie : {editingProduct.category}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={editForm.name} onChange={(e) => handleFormChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prix (FCFA) *</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingProduct(null)} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-gold hover:bg-gold-light text-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue création produit */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Prix (FCFA) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={createForm.price}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded border border-input bg-background px-3 py-2"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={4}
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Photos (cover + galerie)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setCreateImages(Array.from(e.target.files ?? []))}
              />
              {createImages.length > 0 && (
                <p className="text-sm text-muted-foreground">{createImages.length} image(s) sélectionnée(s)</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleCreateProduct} disabled={isCreating}>
                <Upload className="w-4 h-4 mr-2" />
                {isCreating ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue édition produit custom */}
      <Dialog
        open={!!editingCustomProduct}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCustomProduct(null);
            setCustomImagesToRemove([]);
            setCustomNewImages([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier un produit personnalisé</DialogTitle>
          </DialogHeader>
          {editingCustomProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    value={customEditForm.name}
                    onChange={(e) => setCustomEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix (FCFA) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={customEditForm.price}
                    onChange={(e) => setCustomEditForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <select
                    value={customEditForm.category}
                    onChange={(e) => setCustomEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded border border-input bg-background px-3 py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Nouvelles images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setCustomNewImages(Array.from(e.target.files ?? []))}
                  />
                  {customNewImages.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {customNewImages.length} image(s) prête(s) à être ajoutée(s)
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={customEditForm.description}
                  onChange={(e) => setCustomEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <Label>Images existantes</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[customEditForm.coverImage, ...editingCustomProduct.gallery.filter(img => img !== customEditForm.coverImage)]
                    .filter((image): image is string => Boolean(image))
                    .map(image => (
                      <div
                        key={image}
                        className={`border rounded-lg p-2 space-y-2 ${customImagesToRemove.includes(image) ? 'opacity-50' : ''}`}
                      >
                        <img src={image} alt="" className="w-full h-28 object-cover rounded" />
                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customImagesToRemove.includes(image)}
                              onChange={(e) => {
                                setCustomImagesToRemove(prev => {
                                  if (e.target.checked) {
                                    return prev.includes(image) ? prev : [...prev, image];
                                  }
                                  return prev.filter(item => item !== image);
                                });
                              }}
                            />
                            Supprimer
                          </label>
                          <Button
                            size="sm"
                            variant={customEditForm.coverImage === image ? 'default' : 'outline'}
                            onClick={() => setCustomEditForm(prev => ({ ...prev, coverImage: image }))}
                          >
                            {customEditForm.coverImage === image ? 'Cover' : 'Définir'}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingCustomProduct(null)} disabled={isSavingCustom}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={handleSaveCustomProduct} disabled={isSavingCustom}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingCustom ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue catégories */}
      <Dialog open={showCategoriesDialog} onOpenChange={setShowCategoriesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion des catégories</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Ajouter une catégorie</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="ID (slug)"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value }))}
                />
                <Input
                  placeholder="Nom affiché"
                  value={newCategory.label}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
                />
                <Input
                  placeholder="Description (optionnel)"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddCategory} className="mt-2">
                <PlusCircle className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Catégories existantes</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <Card key={category.id}>
                    <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={categoryEdits[category.id]?.label ?? category.label}
                          onChange={(e) =>
                            setCategoryEdits(prev => ({
                              ...prev,
                              [category.id]: {
                                label: e.target.value,
                                description: categoryEdits[category.id]?.description ?? category.description ?? '',
                              },
                            }))
                          }
                        />
                        <Input
                          value={categoryEdits[category.id]?.description ?? category.description ?? ''}
                          placeholder="Description"
                          onChange={(e) =>
                            setCategoryEdits(prev => ({
                              ...prev,
                              [category.id]: {
                                label: categoryEdits[category.id]?.label ?? category.label,
                                description: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleUpdateCategory(category)}
                          disabled={!categoryEdits[category.id]}
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          variant="destructive"
                          disabled={category.isDefault}
                          onClick={() => handleDeleteCategory(category)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default ProductManager;

