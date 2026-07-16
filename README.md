 SMARTSERVICES Schools

Plateforme   dédiée aux établissements scolaires pour la gestion des services opérationnels.

## 🚀 Démarrage rapide

### 1. Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Dans le dashboard Supabase, allez dans **SQL Editor** → **New Query**
3. Copiez-collez le contenu de `database/schema-full.sql`
4. Exécutez le script
5. Allez dans **Authentication** → **Settings**
6. Désactivez **"Confirm email"** pour les tests
7. Récupérez vos identifiants : **Settings** → **API** → Project URL + anon key

### 2. Configuration du projet

Éditez le fichier `.env` à la racine du projet :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-anon-key-ici
```

### 3. Démarrage

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start
```

Ouvrez votre navigateur : **http://localhost:3000**

## 📁 Structure du projet

```
School Pro manager/
├── index.html          # Page d'accueil avec modals auth/service
├── app.html            # Application dashboard (services, demandes, factures)
├── css/
│   └── styles.css      # Styles globaux + modals + RTL
├── js/
│   ├── main.js         # Menu mobile, scroll, header
│   ├── supabase.js     # Client Supabase (lit /api/config)
│   └── auth.js         # Auth : signup/login/logout + modals
├── images/             # Images des services
├── database/
│   ├── schema.sql      # Schéma simple
│   └── schema-full.sql # Schéma complet (utiliser celui-ci)
├── server.js           # Serveur Node.js (lit .env, sert /api/config)
├── .env                # Credentials Supabase (NE PAS COMMIT)
└── package.json
```

## 🔐 Authentification

- **Inscription** : nom, établissement, email, téléphone, mot de passe
- **Connexion** : email + mot de passe
- **Profil auto-créé** lors de l'inscription via trigger PostgreSQL
- **Déconnexion** possible depuis le header

## 🛎️ Services

11 services disponibles avec images et formulaires spécifiques :
- Fournitures de bureau
- Services d'impression
- Organisation d'événements
- Cadeaux & Récompenses scolaires
- Goodies scolaires
- Réparation informatique & CCTV
- Réparation réseau Wi-Fi
- Photographie & Documentation
- Maintenance d'imprimantes
- Consulting
- Service personnalisé

## 🔧 Dépannage

### `process is not defined`

Assurez-vous d'utiliser le serveur Node.js (`npm start`) et non d'ouvrir `index.html` directement.

### `Auth unavailable: Supabase not configured`

Vérifiez votre fichier `.env` et redémarrez le serveur.

## 📄 Licence

ISC