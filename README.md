# O-229 Marketplace — Plateforme Professionnelle d'Achat/Vente au Bénin

O-229 Marketplace est une solution de commerce électronique moderne et robuste, conçue pour connecter les vendeurs et les acheteurs au Bénin via une intégration profonde avec WhatsApp.

## 🚀 Stack Technique

- **Backend** : Laravel 11 (PHP 8.3)
- **Frontend** : Next.js 15+, Tailwind CSS, Shadcn UI
- **Base de données** : PostgreSQL 15
- **Recherche** : Meilisearch (Instant Search)
- **Cache & Tampon** : Redis 7
- **WebSockets** : Laravel Reverb (Real-time notifications)
- **Stockage** : MinIO (S3 Compatible)
- **Paiements** : FedaPay (Mobile Money / Cartes)
- **Notifications** : Evolution API (WhatsApp Gateway)
- **Conteneurisation** : Docker & Docker Compose

## ✨ Fonctionnalités Clés

- **Système de Vendeurs** : Création de boutiques, gestion de produits, KYC (vérification d'identité).
- **Abonnements** : Forfaits Gratuit et Premium gérés via FedaPay avec Webhooks de secours.
- **Modération** : Flux de travail d'approbation administrative des produits avec logs d'audit.
- **Expérience Client** : Recherche ultra-rapide (Meilisearch), notifications temps réel, PWA (App installable).
- **Cerberus Security** : Honeypots, protection anti-ban WhatsApp (message spinning), headers de sécurité.
- **Analytics** : Tracking des clics WhatsApp et des vues produits avec tampon Redis pour la performance.

## 📦 Installation (Docker)

### Prérequis
- Docker et Docker Compose installés.
- Clés API FedaPay et configuration Evolution API.

### Procédure
1. **Cloner le projet** :
   ```bash
   git clone https://github.com/votre-compte/o229-marketplace.git
   cd o229-marketplace
   ```

2. **Configuration** :
   Copiez les fichiers d'exemple et remplissez vos secrets :
   ```bash
   cp backend/.env.example backend/.env
   # Remplissez les clés FEDAPAY, MEILI, WA_API, etc.
   ```

3. **Lancement de l'infrastructure** :
   ```bash
   docker-compose up -d --build
   ```

4. **Initialisation Backend** :
   ```bash
   docker exec -it o229_api composer install
   docker exec -it o229_api php artisan migrate --seed
   docker exec -it o229_api php artisan storage:link
   ```

5. **Accès** :
   - Frontend : `http://localhost:3000`
   - API Backend : `http://localhost:8000`
   - Meilisearch Admin : `http://localhost:7700`

## 🛡️ Sécurité & Robustesse

- **Atomic Locking** : Prévention des race conditions sur les statistiques.
- **Webhook Protection** : Validation asynchrone des paiements pour éviter les pertes de transactions.
- **Audit Logs** : Traçabilité complète des actions administratives.
- **WhatsApp Anti-Ban** : Rotation de caractères invisibles et templates de synonymes pour protéger les comptes émetteurs.

## 📝 Licence
Propriété de O-229 Marketplace. Tous droits réservés.
