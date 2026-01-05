# Guide de gestion des produits (mode sans backend)

Ce projet fonctionne désormais uniquement en local (sans backend Supabase). Les pages `Parfums` et la page d'accueil se mettent automatiquement à jour à partir des dossiers `Parfum Homme` et `Parfum Femme` situés à la racine.

## 1. Où placer les photos
- Placez les visuels masculins dans `Parfum Homme/` et les visuels féminins dans `Parfum Femme/`.
- Les formats suivants sont pris en charge : `jpg`, `jpeg`, `png`, `webp` (majuscules ou minuscules).
- Les fichiers sont triés alphabétiquement/naturellement : renommez-les (`001-...`, `002-...`) si vous voulez contrôler l'ordre d'affichage.

## 2. Comment lier une photo à un produit
- Chaque image du dossier génère automatiquement un produit virtuel (côté homme ou femme).
- L'ID généré suit la forme `homme-1`, `homme-2`, … ou `femme-1`, `femme-2`, … selon sa position dans la liste triée.
- Ces IDs servent de clé pour personnaliser les informations dans `src/data/productOverrides.ts`.

## 3. Ajouter le nom, la description et le prix
Dans `src/data/productOverrides.ts`, remplissez l'objet `productOverrides` :

```ts
export const productOverrides = {
  'homme-1': {
    name: 'Bleu de Chanel',
    price: 65000, // Montant en FCFA
    description: 'Eau de parfum iconique, fraîche et boisée.',
  },
  'femme-3': {
    name: 'J\'adore L\'Or',
    price: 78000,
    description: 'Bouquet floral solaire, sublimé par le jasmin.',
  },
};
```

Conseils :
- `price` est un nombre en FCFA (pas d'espace, pas de symbole).
- Vous pouvez modifier uniquement les champs nécessaires (par exemple, juste `price` pour mettre à jour un tarif).
- Laissez une entrée vide pour garder les valeurs automatiques.

## 4. Totaux et panier
- Les totaux affichés dans le panier proviennent du `CartContext` (`getCartTotal` additionne `price * quantity`).
- Dès que le prix d'un produit est défini dans `productOverrides`, il est pris en compte pour le total, les badges du panier et le checkout.
- Pour tester : `npm install` (si nécessaire) puis `npm run dev`, ajoutez quelques produits au panier et vérifiez les montants.

## 5. Checklist rapide pour chaque mise à jour
1. Ajouter/renommer les photos dans `Parfum Homme/` ou `Parfum Femme/`.
2. Lancer `npm run dev` pour voir les nouvelles vignettes.
3. Noter les IDs générés (`homme-3`, `femme-7`, …) via l'ordre des images.
4. Éditer `productOverrides.ts` pour définir `name`, `price`, `description`.
5. Vérifier dans l'interface : section Homme/Femme + panier → totaux corrects.

Avec ces étapes, vous gardez un site 100 % frontend tout en contrôlant le contenu produit. Bonnes mises à jour !

