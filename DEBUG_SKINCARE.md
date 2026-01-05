# Guide de débogage - Skincare

## Problèmes corrigés

1. ✅ Ajout de logs de débogage dans `skincareCatalog.ts`
2. ✅ Amélioration de la gestion des erreurs d'images dans `ProductCard.tsx`
3. ✅ Amélioration de la fonction `getImageUrl` pour mieux gérer les chemins
4. ✅ Redémarrage du serveur de développement

## Comment vérifier que tout fonctionne

### 1. Ouvrir la console du navigateur
- Appuyez sur `F12` dans votre navigateur
- Allez dans l'onglet "Console"

### 2. Vérifier les logs
Vous devriez voir des messages comme :
```
[SkincareCatalog] Chargement de X images skincare
[SkincareCatalog] Premiers chemins: [...]
[SkincareCatalog] Produit skincare-1: {...}
[Skincare] Produits locaux chargés: X
```

### 3. Vérifier les erreurs
- Si vous voyez des erreurs 404 pour les images, c'est un problème de chemin
- Si vous voyez "0 images skincare", le problème vient du chargement des fichiers

### 4. Vider le cache du navigateur
- Appuyez sur `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac) pour forcer le rechargement
- Ou allez dans les paramètres du navigateur et videz le cache

### 5. Vérifier l'onglet Network
- Dans les DevTools, allez dans l'onglet "Network"
- Rechargez la page
- Filtrez par "Img"
- Vérifiez que les images se chargent (statut 200)

## Structure attendue

Le dossier `skincare/` doit contenir :
- `cremes hydratantes/`
  - `Crèmes visage/`
  - `Gels hydratants/`
  - `Huiles visage/`
- `masques visage/`
  - `Masques de nuit/`
  - `Masques exfoliants/`
  - `Masques tissu/`
- `nettoyants/`
  - `Baumes démaquillants/`
  - `Eaux micellaires/`
  - `Huiles nettoyantes/`
  - `Lingettes nettoyantes & Démaquillants/`
  - `Nettoyants à base d'eau/`
- `traitements/`
  - `Ampoules/`
  - `Essences/`
  - `Sérums/`
  - `Traitements des boutons/`

## Si les images ne s'affichent toujours pas

1. Vérifiez que le serveur est bien démarré : `http://localhost:8080`
2. Vérifiez la console pour les erreurs
3. Vérifiez que les fichiers images existent bien dans les dossiers
4. Essayez de redémarrer le serveur : arrêtez-le (Ctrl+C) et relancez `npm run dev`



