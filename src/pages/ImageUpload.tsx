import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PastedImage {
  id: string;
  file: File;
  preview: string;
  category: string;
  subcategory?: string;
  subSubcategory?: string;
  name?: string;
  price?: number;
  description?: string;
}

const ImageUpload = () => {
  const { isAuthenticated, isAdmin, isAuthEnabled } = useAuth();
  const navigate = useNavigate();
  const [pastedImages, setPastedImages] = useState<PastedImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Parfum Homme');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthEnabled && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, isAuthEnabled, navigate]);

  const handleImageFile = useCallback(async (file: File) => {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Le fichier doit être une image',
        variant: 'destructive',
      });
      return;
    }

    // Créer une prévisualisation
    const preview = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const newImage: PastedImage = {
      id,
      file,
      preview,
      category: selectedCategory,
      subcategory: selectedSubcategory || undefined,
      subSubcategory: selectedSubSubcategory || undefined,
    };

    setPastedImages((prev) => {
      const newList = [...prev, newImage];
      toast({
        title: 'Image ajoutée',
        description: `L'image "${file.name}" a été ajoutée à la liste (${newList.length} image(s) en attente).`,
      });
      return newList;
    });
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory]);

  // Gérer le collage d'images depuis le presse-papiers
  // Fonctionne globalement sur la page, même sans focus
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      let hasImage = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          hasImage = true;
          break;
        }
      }

      if (hasImage) {
        e.preventDefault();
        e.stopPropagation();
        setIsPasting(true);
        
        // Traiter toutes les images du presse-papiers
        const imagePromises: Promise<void>[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              imagePromises.push(handleImageFile(file));
            }
          }
        }

        await Promise.all(imagePromises);
        
        // Réinitialiser l'indicateur après un court délai
        setTimeout(() => setIsPasting(false), 500);
      }
    };

    // Ajouter l'écouteur sur le document pour capturer tous les collages
    document.addEventListener('paste', handlePaste, true);
    return () => document.removeEventListener('paste', handlePaste, true);
  }, [handleImageFile]);

  // Gérer le glisser-déposer
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('border-gold', 'bg-gold/5');
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-gold', 'bg-gold/5');
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('border-gold', 'bg-gold/5');

      const files = e.dataTransfer?.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            await handleImageFile(file);
          }
        }
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [handleImageFile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        await handleImageFile(files[i]);
      }
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setPastedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const updateImageCategory = (id: string, category: string, subcategory?: string, subSubcategory?: string) => {
    setPastedImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, category, subcategory: subcategory || undefined, subSubcategory: subSubcategory || undefined }
          : img
      )
    );
  };

  const updateImageDetails = (id: string, field: 'name' | 'price' | 'description', value: string | number) => {
    setPastedImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, [field]: value }
          : img
      )
    );
  };

  const uploadImages = async () => {
    if (pastedImages.length === 0) {
      toast({
        title: 'Aucune image',
        description: 'Veuillez ajouter au moins une image',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('images', JSON.stringify(pastedImages.map(img => ({
        category: img.category,
        subcategory: img.subcategory,
        subSubcategory: img.subSubcategory,
        name: img.name,
        price: img.price,
        description: img.description,
      }))));

      pastedImages.forEach((img) => {
        formData.append('files', img.file);
      });

      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement des images');
      }

      const result = await response.json();

      // Nettoyer les prévisualisations
      pastedImages.forEach((img) => {
        URL.revokeObjectURL(img.preview);
      });

      setPastedImages([]);
      
      toast({
        title: 'Succès',
        description: `${result.count} image(s) téléchargée(s) avec succès. La liste des images sera régénérée automatiquement.`,
      });

      // Régénérer la liste des images
      try {
        const regenerateResponse = await fetch('/api/regenerate-images', {
          method: 'POST',
        });
        if (regenerateResponse.ok) {
          toast({
            title: 'Liste régénérée',
            description: 'La liste des images a été mise à jour.',
          });
        }
      } catch (error) {
        console.error('Erreur lors de la régénération:', error);
        toast({
          title: 'Attention',
          description: 'Les images ont été téléchargées, mais la liste n\'a pas pu être régénérée automatiquement. Exécutez "npm run generate-images" manuellement.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du téléchargement',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { value: 'Parfum Homme', label: 'Parfum Homme' },
    { value: 'Parfum Femme', label: 'Parfum Femme' },
    { value: 'skincare', label: 'Skincare' },
  ];

  const skincareSubcategories = [
    'cremes hydratantes',
    'masques visage',
    'nettoyants',
    'traitements',
  ];

  const skincareSubSubcategories: Record<string, string[]> = {
    'cremes hydratantes': ['Crèmes visage', 'Gels hydratants', 'Huiles visage'],
    'masques visage': ['Masques de nuit', 'Masques exfoliants', 'Masques tissu'],
    'nettoyants': [
      'Baumes démaquillants',
      'Eaux micellaires',
      'Huiles nettoyantes',
      'Lingettes nettoyantes & Démaquillants',
      'Nettoyants à base d\'eau',
    ],
    'traitements': ['Ampoules', 'Essences', 'Sérums', 'Traitements des boutons'],
  };

  if (isAuthEnabled && (!isAuthenticated || !isAdmin)) {
    return null;
  }

  return (
    <>
      <Header />
      <div 
        ref={containerRef}
        className={`min-h-screen pt-32 pb-20 transition-all duration-300 ${
          isPasting ? 'bg-gold/5' : ''
        }`}
        tabIndex={-1}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
              Upload d'Images
            </h1>
            <p className="text-muted-foreground mb-2">
              Collez des images directement ici (Ctrl+V) ou glissez-déposez-les
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full transition-all ${
                isPasting ? 'bg-gold animate-pulse' : 'bg-muted'
              }`} />
              <span>
                {isPasting 
                  ? 'Traitement des images collées...' 
                  : 'Prêt à recevoir des images - Collez n\'importe où sur cette page'
                }
              </span>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Configuration par défaut</CardTitle>
              <CardDescription>
                Les nouvelles images utiliseront ces paramètres par défaut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                    setSelectedSubSubcategory('');
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory === 'skincare' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Sous-catégorie</Label>
                    <select
                      id="subcategory"
                      value={selectedSubcategory}
                      onChange={(e) => {
                        setSelectedSubcategory(e.target.value);
                        setSelectedSubSubcategory('');
                      }}
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

                  {selectedSubcategory && skincareSubSubcategories[selectedSubcategory] && (
                    <div className="space-y-2">
                      <Label htmlFor="subSubcategory">Sous-sous-catégorie</Label>
                      <select
                        id="subSubcategory"
                        value={selectedSubSubcategory}
                        onChange={(e) => setSelectedSubSubcategory(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      >
                        <option value="">Sélectionner une sous-sous-catégorie</option>
                        {skincareSubSubcategories[selectedSubcategory].map((subSubcat) => (
                          <option key={subSubcat} value={subSubcat}>
                            {subSubcat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Zone de collage et glisser-déposer
              </CardTitle>
              <CardDescription>
                Collez vos images (Ctrl+V) n'importe où sur cette page ou glissez-déposez-les ici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={dropZoneRef}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isPasting
                    ? 'border-gold bg-gold/10 scale-[1.02]'
                    : 'border-border hover:border-gold hover:bg-gold/5'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                  isPasting ? 'text-gold' : 'text-muted-foreground'
                }`} />
                <p className="text-lg font-semibold mb-2">
                  {isPasting 
                    ? 'Images en cours de traitement...' 
                    : 'Cliquez pour sélectionner ou collez vos images (Ctrl+V)'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Formats supportés: JPG, PNG, WEBP • Vous pouvez coller plusieurs images à la fois
                </p>
              </div>
            </CardContent>
          </Card>

          {pastedImages.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">
                  Images à télécharger ({pastedImages.length})
                </h2>
                <Button
                  onClick={uploadImages}
                  disabled={isUploading}
                  className="bg-gold hover:bg-gold-light text-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Téléchargement...' : 'Télécharger toutes les images'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastedImages.map((img) => (
                  <Card key={img.id} className="relative">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <img
                          src={img.preview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(img.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Catégorie</Label>
                          <select
                            value={img.category}
                            onChange={(e) => updateImageCategory(img.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        {img.category === 'skincare' && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Sous-catégorie</Label>
                              <select
                                value={img.subcategory || ''}
                                onChange={(e) =>
                                  updateImageCategory(img.id, img.category, e.target.value)
                                }
                                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                              >
                                <option value="">Aucune</option>
                                {skincareSubcategories.map((subcat) => (
                                  <option key={subcat} value={subcat}>
                                    {subcat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {img.subcategory && skincareSubSubcategories[img.subcategory] && (
                              <div className="space-y-1">
                                <Label className="text-xs">Sous-sous-catégorie</Label>
                                <select
                                  value={img.subSubcategory || ''}
                                  onChange={(e) =>
                                    updateImageCategory(
                                      img.id,
                                      img.category,
                                      img.subcategory,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                                >
                                  <option value="">Aucune</option>
                                  {skincareSubSubcategories[img.subcategory].map((subSubcat) => (
                                    <option key={subSubcat} value={subSubcat}>
                                      {subSubcat}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {img.file.name} ({(img.file.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ImageUpload;

