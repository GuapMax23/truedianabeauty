# Guide d'upload des images

## ✅ Solution implémentée

J'ai créé un système qui scanne automatiquement vos dossiers d'images et génère un fichier avec tous les chemins.

## 📁 Dossiers d'images

Vos images doivent être dans :
- `C:\xampp\htdocs\dianabeauty\public\images\Parfum Homme\` - Photos parfums hommes
- `C:\xampp\htdocs\dianabeauty\public\images\Parfum Femme\` - Photos parfums femmes  
- `C:\xampp\htdocs\dianabeauty\public\images\skincare\` - Photos skincare (avec sous-dossiers)

**Important :** Toutes les images doivent être dans le dossier `public/images/` pour être accessibles sur le site.

## 🔄 Comment régénérer la liste des images

Quand vous ajoutez de nouvelles images, exécutez :

```bash
npm run generate-images
```

Ce script va :
1. Scanner tous les dossiers d'images
2. Générer le fichier `src/data/imagePaths.ts` avec tous les chemins
3. Le site utilisera automatiquement ces nouveaux chemins

## 📝 Structure skincare

Le dossier `public/images/skincare/` doit avoir cette structure :
```
public/images/skincare/
  ├── cremes hydratantes/
  │   ├── Crèmes visage/
  │   ├── Gels hydratants/
  │   └── Huiles visage/
  ├── masques visage/
  │   ├── Masques de nuit/
  │   ├── Masques exfoliants/
  │   └── Masques tissu/
  ├── nettoyants/
  │   ├── Baumes démaquillants/
  │   ├── Eaux micellaires/
  │   ├── Huiles nettoyantes/
  │   ├── Lingettes nettoyantes & Démaquillants/
  │   └── Nettoyants à base d'eau/
  └── traitements/
      ├── Ampoules/
      ├── Essences/
      ├── Sérums/
      └── Traitements des boutons/
```

## 🖼️ Formats d'images supportés

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## ⚙️ Configuration

Le serveur Vite sert automatiquement le dossier `public/`. Les images sont accessibles via :
- `/images/Parfum Homme/nom-fichier.jpg`
- `/images/Parfum Femme/nom-fichier.jpg`
- `/images/skincare/sous-dossier/sous-sous-dossier/nom-fichier.jpg`

## 🚀 Après avoir ajouté des images

1. Exécutez `npm run generate-images`
2. Rechargez le site (Ctrl+Shift+R)
3. Les nouvelles images apparaîtront automatiquement


