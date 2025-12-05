# Guide Complet : Option A - Table Unifiée + Vues

## 📊 Architecture

### Table Principale
```
chat_logs (table physique)
  ├── Tous les chats de tous les services
  └── Colonne service_type pour différencier
```

### Vues par Service
```
web_dev_chats (vue)
app_dev_chats (vue)
image_processing_chats (vue)
video_services_chats (vue)
```

## 🚀 Installation Complète

### Étape 1 : Créer les Vues (✅ Déjà fait)
Les vues ont été créées automatiquement dans PostgreSQL.

### Étape 2 : Reconstruire le Frontend
Le frontend est en cours de reconstruction avec le nouveau code.

### Étape 3 : Importer le Workflow dans n8n

1. **Ouvrez n8n** : http://localhost:5678
2. **Créez un workflow** : Workflows → Add workflow
3. **Importez** : ⋮ → Import from file
4. **Sélectionnez** : `back/n8n-workflows/unified-chat-log.json`

### Étape 4 : Configurer PostgreSQL

1. Ouvrez le workflow importé
2. Cliquez sur **"Insert Chat Log"**
3. Configurez le credential :
   - Host: `postgres`
   - Port: `5432`
   - Database: `devflow_db`
   - User: `devflow`
   - Password: `32gdF.2\`HR'n`
   - SSL: Disable

### Étape 5 : Activer le Workflow

Basculez le switch **"Active"** (vert) en haut à droite.

## 🧪 Tester avec 4 Chats

### Depuis l'Application

1. **Rafraîchissez** : http://localhost:8080 (Ctrl+Shift+R)
2. **Connectez-vous** avec Alice
3. **Sélectionnez un service**
4. **Cliquez sur les 4 boutons** :
   - 🌐 Test Website Chat
   - 📱 Test Mobile App Chat
   - 🖼️ Test Image Processing
   - 🎬 Test Video Services

### Vérifier dans PostgreSQL

#### Table Principale
```sql
-- Voir tous les chats
SELECT * FROM chat_logs ORDER BY created_at DESC;

-- Compter par service
SELECT service_type, COUNT(*) as total 
FROM chat_logs 
GROUP BY service_type;
```

#### Vues par Service
```sql
-- Chats Web Dev uniquement
SELECT * FROM web_dev_chats;

-- Chats App Dev uniquement
SELECT * FROM app_dev_chats;

-- Chats Image Processing uniquement
SELECT * FROM image_processing_chats;

-- Chats Video Services uniquement
SELECT * FROM video_services_chats;
```

## 📋 Résultat Attendu

### Table chat_logs
```
 id | session_id | service_type      | company_name | phone        | content
----+------------+-------------------+--------------+--------------+---------------------------
  1 | abc-123    | WEB_DEV          | Test Company | +33000000000 | Test message for WEB_DEV
  2 | abc-123    | APP_DEV          | Test Company | +33000000000 | Test message for APP_DEV
  3 | abc-123    | IMAGE_PROCESSING | Test Company | +33000000000 | Test message for IMAGE...
  4 | abc-123    | VIDEO_PROCESSING | Test Company | +33000000000 | Test message for VIDEO...
```

### Comptage par Service
```
 service_type      | total 
-------------------+-------
 WEB_DEV          |     1
 APP_DEV          |     1
 IMAGE_PROCESSING |     1
 VIDEO_PROCESSING |     1
```

### Vue web_dev_chats
```
 id | session_id | service_type | company_name | content
----+------------+--------------+--------------+---------------------------
  1 | abc-123    | WEB_DEV      | Test Company | Test message for WEB_DEV
```

## 🎯 Avantages de cette Solution

✅ **Simple** : 1 table, 1 workflow  
✅ **Organisé** : 4 vues pour consulter par domaine  
✅ **Flexible** : Facile d'ajouter de nouveaux services  
✅ **Performant** : Requêtes rapides avec index sur service_type  
✅ **Analytique** : Possibilité d'analyses cross-services

## 🔍 Requêtes Utiles

```sql
-- Clients ayant utilisé plusieurs services
SELECT company_name, 
       COUNT(DISTINCT service_type) as services_count,
       STRING_AGG(DISTINCT service_type, ', ') as services
FROM chat_logs 
GROUP BY company_name
HAVING COUNT(DISTINCT service_type) > 1;

-- Messages les plus longs par service
SELECT service_type, 
       MAX(LENGTH(content)) as longest_message
FROM chat_logs 
GROUP BY service_type;

-- Activité par service (dernières 24h)
SELECT service_type, COUNT(*) as messages_today
FROM chat_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY service_type;
```

## ✅ Checklist

- [ ] Vues créées dans PostgreSQL
- [ ] Frontend reconstruit
- [ ] Workflow importé dans n8n
- [ ] Credentials PostgreSQL configurés
- [ ] Workflow activé
- [ ] 4 chats testés
- [ ] Données vérifiées dans chat_logs
- [ ] Vues testées (web_dev_chats, etc.)
