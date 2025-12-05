# Guide : Workflows Unifiés n8n

## 🎯 Concept

Au lieu de 8 workflows séparés, vous avez maintenant **1 seul workflow** qui gère tous les services :

- **Unified Chat Log - All Services** : Gère les 4 types de services (WEB_DEV, APP_DEV, IMAGE_PROCESSING, VIDEO_PROCESSING)

## 📥 Installation

### 1. Importer le Workflow Unifié

1. Allez sur http://localhost:5678
2. Cliquez sur **"Workflows"** → **"Add workflow"**
3. Cliquez sur **⋮** (3 points) → **"Import from file"**
4. Sélectionnez `back/n8n-workflows/unified-chat-log.json`
5. Le workflow est importé !

### 2. Configurer les Credentials PostgreSQL

1. Ouvrez le workflow **"Unified Chat Log - All Services"**
2. Cliquez sur le node **"Insert Chat Log"**
3. Dans **"Credential to connect with"**, sélectionnez votre credential PostgreSQL
4. Si vous n'en avez pas, créez-en un :
   - Host: `postgres`
   - Port: `5432`
   - Database: `devflow_db`
   - User: `devflow`
   - Password: `32gdF.2\`HR'n`

### 3. Activer le Workflow

1. En haut à droite, basculez le switch sur **"Active"** (vert)
2. Le workflow est maintenant prêt !

## 🧪 Tester

### Depuis l'Application

1. Ouvrez http://localhost:8080
2. Connectez-vous avec Alice
3. Sélectionnez un service
4. Cliquez sur les 4 boutons de test
5. Vérifiez dans PostgreSQL :

```sql
SELECT service_type, COUNT(*) FROM chat_logs GROUP BY service_type;
```

### Test Direct avec curl

```bash
# Test WEB_DEV
curl -X POST http://localhost:5678/webhook/chat-log \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "service_type": "WEB_DEV",
    "company_name": "Test Company",
    "phone": "+33123456789",
    "role": "user",
    "content": "Test message",
    "timestamp": "2025-12-05T14:00:00Z"
  }'

# Test APP_DEV
curl -X POST http://localhost:5678/webhook/chat-log \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-456",
    "service_type": "APP_DEV",
    "company_name": "Test Company",
    "phone": "+33123456789",
    "role": "user",
    "content": "Test message",
    "timestamp": "2025-12-05T14:00:00Z"
  }'
```

## 📊 Webhook URL

**Un seul webhook pour tous les services :**
```
http://localhost:5678/webhook/chat-log
```

Le `service_type` est passé dans le body de la requête :
- `WEB_DEV`
- `APP_DEV`
- `IMAGE_PROCESSING`
- `VIDEO_PROCESSING`

## ✅ Avantages

- ✅ **1 workflow au lieu de 4** pour les chat logs
- ✅ **Plus facile à maintenir**
- ✅ **Credentials configurés une seule fois**
- ✅ **Un seul webhook à activer**
- ✅ **Moins de confusion**

## 🔍 Vérification

Après avoir testé, vérifiez que les données sont bien enregistrées :

```sql
-- Voir tous les logs
SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT 10;

-- Compter par service
SELECT service_type, COUNT(*) as total 
FROM chat_logs 
GROUP BY service_type;

-- Voir les derniers messages par service
SELECT service_type, content, created_at 
FROM chat_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

## 🎉 Résultat Attendu

```
 service_type      | total 
-------------------+-------
 WEB_DEV          |     1
 APP_DEV          |     1
 IMAGE_PROCESSING |     1
 VIDEO_PROCESSING |     1
```
