# Guide de Configuration n8n - DevFlow Concierge

Ce guide vous explique comment configurer les workflows n8n pour votre application DevFlow Concierge.

## Prérequis

- Un compte n8n (cloud ou self-hosted)
- Accès à votre base de données PostgreSQL
- Une clé API OpenAI (pour la génération de requirements)

---

## Étape 1 : Importer les Workflows dans n8n

### Option A : n8n Cloud
1. Connectez-vous à votre instance n8n : https://app.n8n.cloud
2. Cliquez sur **"Workflows"** dans le menu de gauche
3. Cliquez sur **"Add workflow"** → **"Import from file"**
4. Importez chaque fichier JSON un par un depuis `back/n8n-workflows/` :
   - `chat-log-web-dev.json`
   - `chat-log-app-dev.json`
   - `chat-log-image-processing.json`
   - `chat-log-video-services.json`
   - `generate-requirements-web-dev.json`
   - `generate-requirements-app-dev.json`
   - `generate-requirements-image-processing.json`
   - `generate-requirements-video-services.json`

### Option B : n8n Self-Hosted
1. Accédez à votre instance n8n (ex: http://localhost:5678)
2. Suivez les mêmes étapes que pour n8n Cloud

---

## Étape 2 : Configurer les Credentials PostgreSQL

### 2.1 Créer le Credential PostgreSQL
1. Dans n8n, cliquez sur **"Credentials"** dans le menu
2. Cliquez sur **"Add Credential"**
3. Recherchez et sélectionnez **"Postgres"**
4. Remplissez les informations :
   ```
   Host: localhost (ou votre host PostgreSQL)
   Database: devflow_db
   User: devflow
   Password: devflow123
   Port: 5432
   SSL: Disable (ou Enable selon votre config)
   ```
5. Cliquez sur **"Save"**
6. **Notez l'ID du credential** (visible dans l'URL ou les détails)

### 2.2 Mettre à Jour les Workflows
Pour chaque workflow importé :
1. Ouvrez le workflow
2. Cliquez sur le node PostgreSQL (ex: "Insert Chat Log" ou "Save Requirements to DB")
3. Dans les paramètres, section **"Credential to connect with"**
4. Sélectionnez le credential PostgreSQL que vous venez de créer
5. Cliquez sur **"Save"** en haut à droite du workflow

---

## Étape 3 : Configurer les Credentials OpenAI

**Note:** Nécessaire uniquement pour les workflows `generate-requirements-*`

### 3.1 Obtenir une Clé API OpenAI
1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Copiez la clé (elle ne sera affichée qu'une fois)

### 3.2 Créer le Credential OpenAI dans n8n
1. Dans n8n, allez dans **"Credentials"**
2. Cliquez sur **"Add Credential"**
3. Recherchez et sélectionnez **"OpenAI"**
4. Collez votre clé API
5. Cliquez sur **"Save"**

### 3.3 Mettre à Jour les Workflows Generate Requirements
Pour chaque workflow `generate-requirements-*` :
1. Ouvrez le workflow
2. Cliquez sur le node **"Call AI to Summarize"**
3. Dans les paramètres, section **"Credential to connect with"**
4. Sélectionnez le credential OpenAI
5. Cliquez sur **"Save"**

---

## Étape 4 : Exécuter le Schéma de Base de Données

### Option A : Via Docker (Recommandé)
Si vous utilisez Docker Compose :

```bash
# Depuis le répertoire racine du projet
docker-compose exec postgres psql -U devflow -d devflow_db -f /docker-entrypoint-initdb.d/02-n8n-tables.sql
```

### Option B : Via psql en Local
```bash
psql -U devflow -d devflow_db -f back/init-db/02-n8n-tables.sql
```

### Option C : Via un Client PostgreSQL (pgAdmin, DBeaver, etc.)
1. Ouvrez `back/init-db/02-n8n-tables.sql`
2. Copiez le contenu
3. Exécutez-le dans votre client PostgreSQL

### Vérification
Vérifiez que les tables ont été créées :
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_logs', 'requirements');
```

---

## Étape 5 : Mettre à Jour les URLs des Webhooks

### 5.1 Récupérer les URLs des Webhooks
Pour chaque workflow dans n8n :
1. Ouvrez le workflow
2. Cliquez sur le node **"Webhook"** (premier node)
3. Cliquez sur **"Test URL"** ou **"Production URL"**
4. Copiez l'URL complète (ex: `https://your-instance.app.n8n.cloud/webhook/chat-log-web-dev`)

### 5.2 Mettre à Jour constants.ts
Ouvrez `front/constants.ts` et mettez à jour les URLs :

```typescript
// Remplacez ces URLs par vos URLs n8n
export const N8N_WEBHOOKS = {
  WEB_DEV: {
    CHAT_LOG: "https://your-n8n.app.n8n.cloud/webhook/chat-log-web-dev",
    GEN_REQ: "https://your-n8n.app.n8n.cloud/webhook/generate-requirements-web-dev"
  },
  APP_DEV: {
    CHAT_LOG: "https://your-n8n.app.n8n.cloud/webhook/chat-log-app-dev",
    GEN_REQ: "https://your-n8n.app.n8n.cloud/webhook/generate-requirements-app-dev"
  },
  IMAGE_PROCESSING: {
    CHAT_LOG: "https://your-n8n.app.n8n.cloud/webhook/chat-log-image-processing",
    GEN_REQ: "https://your-n8n.app.n8n.cloud/webhook/generate-requirements-image-processing"
  },
  VIDEO_PROCESSING: {
    CHAT_LOG: "https://your-n8n.app.n8n.cloud/webhook/chat-log-video-services",
    GEN_REQ: "https://your-n8n.app.n8n.cloud/webhook/generate-requirements-video-services"
  }
};
```

---

## Activation des Workflows

**Important:** N'oubliez pas d'activer chaque workflow !

1. Ouvrez chaque workflow dans n8n
2. En haut à droite, basculez le switch **"Active"** sur ON
3. Le workflow est maintenant prêt à recevoir des requêtes

---

## Test des Workflows

### Test Chat Log
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/chat-log-web-dev \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "company_name": "Test Company",
    "phone": "+33123456789",
    "role": "user",
    "content": "Hello, I need a website",
    "timestamp": "2025-12-05T12:00:00Z"
  }'
```

### Test Generate Requirements
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/generate-requirements-web-dev \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "company_name": "Test Company",
    "phone": "+33123456789",
    "messages": [
      {"role": "user", "content": "I need an e-commerce website"},
      {"role": "model", "content": "What features do you need?"}
    ]
  }'
```

---

## Dépannage

### Erreur "Credential not found"
- Vérifiez que vous avez bien configuré les credentials PostgreSQL et OpenAI
- Assurez-vous d'avoir sélectionné le bon credential dans chaque node

### Erreur "Table does not exist"
- Vérifiez que vous avez bien exécuté le script `02-n8n-tables.sql`
- Vérifiez la connexion à la base de données

### Webhook ne répond pas
- Vérifiez que le workflow est bien **activé** (switch ON)
- Vérifiez l'URL du webhook
- Consultez les logs d'exécution dans n8n

---

## Support

Pour plus d'informations :
- Documentation n8n : https://docs.n8n.io
- Documentation PostgreSQL : https://www.postgresql.org/docs/
- Documentation OpenAI : https://platform.openai.com/docs
