import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname);

// Créer le dossier temp s'il n'existe pas
const tempDir = path.join(rootDir, 'public', 'images', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const app = express();
const PORT = 3001;

// Configuration de multer pour gérer les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Le dossier sera déterminé dynamiquement dans le handler
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Middleware pour parser JSON
app.use(express.json());

// Servir les fichiers statiques depuis public
app.use(express.static(path.join(rootDir, 'public')));

// CORS pour permettre les requêtes depuis le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Créer les dossiers nécessaires s'ils n'existent pas
const ensureDirectories = () => {
  const baseDir = path.join(rootDir, 'public', 'images');
  const dirs = [
    path.join(baseDir, 'Parfum Homme'),
    path.join(baseDir, 'Parfum Femme'),
    path.join(baseDir, 'skincare'),
    path.join(baseDir, 'temp'),
  ];

  // Créer aussi les sous-dossiers skincare
  const skincareSubdirs = [
    'cremes hydratantes/Crèmes visage',
    'cremes hydratantes/Gels hydratants',
    'cremes hydratantes/Huiles visage',
    'masques visage/Masques de nuit',
    'masques visage/Masques exfoliants',
    'masques visage/Masques tissu',
    'nettoyants/Baumes démaquillants',
    'nettoyants/Eaux micellaires',
    'nettoyants/Huiles nettoyantes',
    'nettoyants/Lingettes nettoyantes & Démaquillants',
    'nettoyants/Nettoyants à base d\'eau',
    'traitements/Ampoules',
    'traitements/Essences',
    'traitements/Sérums',
    'traitements/Traitements des boutons',
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  skincareSubdirs.forEach((subdir) => {
    const fullPath = path.join(baseDir, 'skincare', subdir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

ensureDirectories();

const PRODUCT_DATA_START = '/*PRODUCT_DATA*/';
const PRODUCT_DATA_END = '/*END_PRODUCT_DATA*/';
const productDataPath = path.join(rootDir, 'src', 'data', 'products.ts');

const readProductData = () => {
  const fileContent = fs.readFileSync(productDataPath, 'utf-8');
  const startIndex = fileContent.indexOf(PRODUCT_DATA_START);
  const endIndex = fileContent.indexOf(PRODUCT_DATA_END);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Impossible de trouver les marqueurs PRODUCT_DATA dans src/data/products.ts');
  }

  const rawJson = fileContent
    .substring(startIndex + PRODUCT_DATA_START.length, endIndex)
    .trim();

  const parsed = rawJson ? JSON.parse(rawJson) : {};

  const data = {
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    customProducts: Array.isArray(parsed.customProducts) ? parsed.customProducts : [],
    hiddenProductIds: Array.isArray(parsed.hiddenProductIds) ? parsed.hiddenProductIds : [],
  };

  return {
    data,
    fileContent,
    startIndex,
    endIndex,
  };
};

const writeProductData = (data, meta) => {
  const serialized = JSON.stringify(data, null, 2);
  const before = meta.fileContent.slice(0, meta.startIndex + PRODUCT_DATA_START.length);
  const after = meta.fileContent.slice(meta.endIndex);
  const newContent = `${before}\n${serialized}\n${after}`;
  fs.writeFileSync(productDataPath, newContent, 'utf-8');
};

const slugify = (value = '') => {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'produit';
};

const generateProductId = (category, name) => {
  const base = `${category || 'custom'}-${slugify(name)}`;
  return `${base}-${Date.now().toString(36)}`;
};

const getCustomProductDir = (productId) => {
  return path.join(rootDir, 'public', 'images', 'custom', productId);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const moveFilesToProductDir = (files = [], productId) => {
  if (!files.length) return [];
  const dir = getCustomProductDir(productId);
  ensureDir(dir);

  return files.map((file) => {
    const ext = path.extname(file.originalname || file.filename) || '.jpg';
    const newName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const finalPath = path.join(dir, newName);
    fs.renameSync(file.path, finalPath);
    return `/images/custom/${productId}/${newName}`.replace(/\\/g, '/');
  });
};

const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const cleanPath = imagePath.replace(/^\/+/, '');
  const absolutePath = path.join(rootDir, 'public', cleanPath);
  if (absolutePath.startsWith(path.join(rootDir, 'public')) && fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
};

const deleteProductDirectory = (productId) => {
  const dir = getCustomProductDir(productId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

// Route pour uploader les images
app.post('/api/upload-images', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const imagesInfo = JSON.parse(req.body.images || '[]');
    const uploadedFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const info = imagesInfo[i] || { category: 'Parfum Homme' };

      // Déterminer le chemin de destination
      let destPath;
      if (info.category === 'Parfum Homme') {
        destPath = path.join(rootDir, 'public', 'images', 'Parfum Homme');
      } else if (info.category === 'Parfum Femme') {
        destPath = path.join(rootDir, 'public', 'images', 'Parfum Femme');
      } else if (info.category === 'skincare') {
        let skincarePath = path.join(rootDir, 'public', 'images', 'skincare');
        if (info.subcategory) {
          skincarePath = path.join(skincarePath, info.subcategory);
          if (info.subSubcategory) {
            skincarePath = path.join(skincarePath, info.subSubcategory);
          }
        }
        destPath = skincarePath;
      } else {
        destPath = path.join(rootDir, 'public', 'images', 'Parfum Homme');
      }

      // S'assurer que le dossier existe
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }

      // Générer un nom de fichier unique
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const newFileName = `${baseName}-${timestamp}-${random}${ext}`;
      const finalPath = path.join(destPath, newFileName);

      // Déplacer le fichier
      fs.renameSync(file.path, finalPath);

      uploadedFiles.push({
        originalName: file.originalname,
        savedPath: finalPath,
        category: info.category,
      });
    }

    res.json({
      success: true,
      count: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour régénérer la liste des images
app.post('/api/regenerate-images', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync('npm run generate-images', {
      cwd: rootDir,
    });

    if (stderr && !stderr.includes('✅')) {
      console.error('Erreur lors de la régénération:', stderr);
      return res.status(500).json({ error: stderr });
    }

    res.json({
      success: true,
      message: 'Liste des images régénérée avec succès',
      output: stdout,
    });
  } catch (error) {
    console.error('Erreur lors de la régénération:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour sauvegarder les détails d'un produit dans productOverrides.ts
app.post('/api/save-product-override', async (req, res) => {
  try {
    const { id, ids, name, price, description } = req.body;

    // Support single id or array of ids
    const targetIds = ids || (id ? [id] : []);

    if (targetIds.length === 0) {
      return res.status(400).json({ error: 'ID(s) du produit requis' });
    }

    const productOverridesPath = path.join(rootDir, 'src', 'data', 'productOverrides.ts');

    // Lire le fichier actuel
    let content = fs.readFileSync(productOverridesPath, 'utf-8');

    // Extraire l'objet productOverrides
    const overrideMatch = content.match(/export const productOverrides[^=]*=\s*\{([\s\S]*?)\};/);

    if (!overrideMatch) {
      return res.status(500).json({ error: 'Format du fichier productOverrides.ts invalide' });
    }

    // Parser les overrides existants
    const existingOverrides = {};
    const existingContent = overrideMatch[1].trim();

    // Extraire les entrées existantes (simple parsing)
    const entryRegex = /'([^']+)':\s*\{([^}]+)\}/g;
    let match;
    while ((match = entryRegex.exec(existingContent)) !== null) {
      const key = match[1];
      const valueStr = match[2];
      const override = {};

      // Parser name
      const nameMatch = valueStr.match(/name:\s*['"]((?:\\'|[^'])+)['"]/);
      if (nameMatch) {
        override.name = nameMatch[1].replace(/\\\\/g, '\\').replace(/\\'/g, "'");
      }

      // Parser price
      const priceMatch = valueStr.match(/price:\s*(\d+)/);
      if (priceMatch) override.price = parseFloat(priceMatch[1]);

      // Parser description
      const descMatch = valueStr.match(/description:\s*['"]((?:\\'|[^'])+)['"]/);
      if (descMatch) {
        // Unescape the read description: replace \\ with \ and \' with '
        override.description = descMatch[1].replace(/\\\\/g, '\\').replace(/\\'/g, "'");
      }

      existingOverrides[key] = override;
    }

    // Mettre à jour tous les IDs ciblés
    targetIds.forEach(targetId => {
      const override = existingOverrides[targetId] || {};
      if (name) override.name = name;
      if (price !== undefined && price !== null && price !== '') override.price = parseFloat(price);
      if (description) override.description = description;
      existingOverrides[targetId] = override;
    });

    // Reconstruire le contenu du fichier
    const overridesEntries = Object.entries(existingOverrides)
      .map(([key, value]) => {
        const parts = [];
        if (value.name) {
          const safeName = value.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          parts.push(`name: '${safeName}'`);
        }
        if (value.price !== undefined) parts.push(`price: ${value.price}`);
        if (value.description) {
          const safeDescription = value.description
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
          parts.push(`description: '${safeDescription}'`);
        }
        return `  '${key}': {\n    ${parts.join(',\n    ')}\n  }`;
      })
      .join(',\n');

    const newContent = `import type { Product } from '@/contexts/CartContext';

export interface ProductOverride extends Partial<Product> {
  price?: number;
}

/**
 * Surcharge facultative pour personnaliser les informations produits.
 * - La clé correspond à l'ID généré automatiquement (\`homme-1\`, \`femme-3\`, etc.)
 * - Remplissez uniquement les champs que vous souhaitez remplacer.
 */
export const productOverrides: Record<string, ProductOverride> = {
${overridesEntries}
};
`;

    // Sauvegarder le fichier
    fs.writeFileSync(productOverridesPath, newContent, 'utf-8');

    res.json({
      success: true,
      message: `${targetIds.length} produit(s) mis à jour avec succès`,
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Gestion locale des produits et catégories ---

app.get('/api/products-data', (req, res) => {
  try {
    const { data } = readProductData();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Erreur lecture products-data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/custom-products', upload.array('images'), (req, res) => {
  try {
    const { name, price, description = '', category, id } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Nom, catégorie et prix sont requis' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Ajoutez au moins une image' });
    }

    const meta = readProductData();
    const data = meta.data;
    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice)) {
      return res.status(400).json({ error: 'Le prix doit être un nombre' });
    }

    const productId = id?.trim() || generateProductId(category, name);
    const existing = data.customProducts.find(product => product.id === productId);
    if (existing) {
      return res.status(400).json({ error: 'Un produit avec cet ID existe déjà' });
    }

    const savedImages = moveFilesToProductDir(req.files, productId);
    const now = new Date().toISOString();
    const record = {
      id: productId,
      name: name.trim(),
      price: numericPrice,
      description: description?.trim() || '',
      category,
      coverImage: savedImages[0],
      gallery: savedImages.slice(1),
      createdAt: now,
      updatedAt: now,
    };

    data.customProducts.push(record);
    writeProductData(data, meta);

    res.json({ success: true, product: record });
  } catch (error) {
    console.error('Erreur création produit personnalisé:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/custom-products/:id', upload.array('images'), (req, res) => {
  try {
    const { id } = req.params;
    const meta = readProductData();
    const data = meta.data;
    const product = data.customProducts.find(item => item.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    const {
      name,
      price,
      description,
      category,
      coverImage,
      removeImages,
    } = req.body;

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (category) product.category = category;
    if (price !== undefined && price !== null && price !== '') {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice)) {
        return res.status(400).json({ error: 'Le prix doit être un nombre' });
      }
      product.price = numericPrice;
    }

    const imagesToRemove = JSON.parse(removeImages || '[]');
    let coverNeedsReplacement = false;
    if (Array.isArray(imagesToRemove) && imagesToRemove.length) {
      product.gallery = product.gallery.filter(img => {
        if (imagesToRemove.includes(img)) {
          deleteImageFile(img);
          return false;
        }
        return true;
      });

      if (imagesToRemove.includes(product.coverImage)) {
        deleteImageFile(product.coverImage);
        product.coverImage = '';
        coverNeedsReplacement = true;
      }
    }

    let newImages = moveFilesToProductDir(req.files, product.id);

    if (coverNeedsReplacement || !product.coverImage) {
      const replacement = newImages[0] || product.gallery[0];
      if (!replacement) {
        return res.status(400).json({ error: 'Ajoutez au moins une image pour ce produit' });
      }
      product.coverImage = replacement;
      if (newImages[0] === replacement) {
        newImages = newImages.slice(1);
      } else {
        product.gallery = product.gallery.filter(img => img !== replacement);
      }
    }

    if (newImages.length) {
      product.gallery = [...product.gallery, ...newImages.filter(img => img !== product.coverImage)];
    }

    if (coverImage) {
      const candidateExists =
        coverImage === product.coverImage ||
        product.gallery.includes(coverImage) ||
        newImages.includes(coverImage);

      if (candidateExists) {
        product.gallery = [product.coverImage, ...product.gallery.filter(img => img !== coverImage)];
        product.coverImage = coverImage;
        product.gallery = product.gallery.filter(img => img !== product.coverImage);
      }
    }

    if (!product.coverImage) {
      return res.status(400).json({ error: 'Le produit doit contenir au moins une image' });
    }

    product.updatedAt = new Date().toISOString();
    writeProductData(data, meta);

    res.json({ success: true, product });
  } catch (error) {
    console.error('Erreur mise à jour produit personnalisé:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/custom-products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const meta = readProductData();
    const data = meta.data;
    const index = data.customProducts.findIndex(product => product.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }

    data.customProducts.splice(index, 1);
    deleteProductDirectory(id);
    data.hiddenProductIds = data.hiddenProductIds.filter(productId => productId !== id);

    writeProductData(data, meta);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression produit personnalisé:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hidden-products', (req, res) => {
  try {
    const { productId, hidden } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId requis' });
    }

    const meta = readProductData();
    const data = meta.data;
    const hiddenSet = new Set(data.hiddenProductIds);
    if (hidden) {
      hiddenSet.add(productId);
    } else {
      hiddenSet.delete(productId);
    }
    data.hiddenProductIds = Array.from(hiddenSet);
    writeProductData(data, meta);

    res.json({ success: true, hiddenProductIds: data.hiddenProductIds });
  } catch (error) {
    console.error('Erreur mise à jour masquage produit:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { id, label, description } = req.body;
    if (!id || !label) {
      return res.status(400).json({ error: 'ID et label requis' });
    }

    const meta = readProductData();
    const data = meta.data;

    if (data.categories.some(category => category.id === id)) {
      return res.status(400).json({ error: 'Cette catégorie existe déjà' });
    }

    data.categories.push({
      id,
      label,
      description: description || '',
      isDefault: false,
    });

    writeProductData(data, meta);
    res.json({ success: true, categories: data.categories });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { label, description } = req.body;

    const meta = readProductData();
    const data = meta.data;
    const category = data.categories.find(cat => cat.id === id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }

    if (label) category.label = label;
    if (description !== undefined) category.description = description;

    writeProductData(data, meta);
    res.json({ success: true, category });
  } catch (error) {
    console.error('Erreur mise à jour catégorie:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const meta = readProductData();
    const data = meta.data;
    const category = data.categories.find(cat => cat.id === id);

    if (!category) {
      return res.status(404).json({ error: 'Catégorie introuvable' });
    }

    if (category.isDefault) {
      return res.status(400).json({ error: 'Impossible de supprimer une catégorie par défaut' });
    }

    const isUsed = data.customProducts.some(product => product.category === id);
    if (isUsed) {
      return res.status(400).json({ error: 'Catégorie utilisée par un produit' });
    }

    data.categories = data.categories.filter(cat => cat.id !== id);
    writeProductData(data, meta);

    res.json({ success: true, categories: data.categories });
  } catch (error) {
    console.error('Erreur suppression catégorie:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📁 Dossier racine: ${rootDir}`);
});

