# Guide Rapide : Démarrer n8n Localement

## 🚀 Démarrage

### 1. Démarrer tous les services (incluant n8n)
```bash
docker-compose up -d
```

### 2. Accéder à n8n
Ouvrez votre navigateur et allez sur : **http://localhost:5678**

**Identifiants par défaut :**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Important :** Changez ces identifiants en production !

---

## 📥 Importer les Workflows

### Méthode 1 : Via l'Interface n8n (Recommandé)

1. **Connectez-vous à n8n** : http://localhost:5678
2. Cliquez sur **"Workflows"** dans le menu de gauche
3. Cliquez sur **"Add workflow"** (bouton +)
4. Cliquez sur les **3 points** (⋮) en haut à droite
5. Sélectionnez **"Import from file"**
6. Naviguez vers `back/n8n-workflows/` et sélectionnez un fichier JSON
7. Répétez pour chaque workflow (8 fichiers au total)

### Méthode 2 : Via l'API n8n (Automatique)

Créez un script pour importer tous les workflows automatiquement :

```bash
# Dans le répertoire racine du projet
cd back/n8n-workflows

# Importer tous les workflows
for file in *.json; do
  if [ "$file" != "README.md" ]; then
    curl -X POST http://localhost:5678/api/v1/workflows \
      -u admin:admin123 \
      -H "Content-Type: application/json" \
      -d @"$file"
  fi
done
```

**Sous Windows (PowerShell) :**
```powershell
cd back\n8n-workflows

Get-ChildItem -Filter *.json | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    Invoke-RestMethod -Uri "http://localhost:5678/api/v1/workflows" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"} `
        -Credential (Get-Credential -UserName admin -Message "Enter n8n password") `
        -Body $content
}
```

---

## ⚙️ Configuration des Credentials

### 1. PostgreSQL Credential

1. Dans n8n, allez dans **"Credentials"** (menu de gauche)
2. Cliquez sur **"Add Credential"**
3. Recherchez **"Postgres"**
4. Remplissez :
   ```
   Host: postgres
   Database: devflow_db
   User: devflow
   Password: devflow123
   Port: 5432
   SSL: Disable
   ```
5. Cliquez sur **"Save"**

### 2. OpenAI Credential

1. Obtenez votre clé API sur https://platform.openai.com/api-keys
2. Dans n8n, **"Credentials"** → **"Add Credential"**
3. Recherchez **"OpenAI"**
4. Collez votre clé API
5. Cliquez sur **"Save"**

### 3. Assigner les Credentials aux Workflows

Pour chaque workflow :
1. Ouvrez le workflow
2. Cliquez sur chaque node qui nécessite un credential (PostgreSQL ou OpenAI)
3. Sélectionnez le credential approprié
4. **Sauvegardez le workflow**

---

## ✅ Activer les Workflows

**Important :** Les workflows importés sont inactifs par défaut !

Pour chaque workflow :
1. Ouvrez le workflow
2. En haut à droite, basculez le switch **"Active"** sur **ON**
3. Le workflow est maintenant prêt

---

## 🧪 Tester les Workflows

### Test Chat Log (Web Dev)
```bash
curl -X POST http://localhost:5678/webhook/chat-log-web-dev \
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

**Réponse attendue :**
```json
{
  "status": "ok",
  "service": "WEB_DEV",
  "session_id": "test-123"
}
```

### Vérifier dans la Base de Données
```bash
docker-compose exec postgres psql -U devflow -d devflow_db -c "SELECT * FROM chat_logs;"
```

---

## 🔧 Commandes Utiles

### Voir les logs n8n
```bash
docker-compose logs -f n8n
```

### Redémarrer n8n
```bash
docker-compose restart n8n
```

### Arrêter tous les services
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données)
```bash
docker-compose down -v
```

---

## 📊 URLs des Webhooks

Une fois les workflows activés, vos webhooks seront disponibles à :

**Chat Logs :**
- Web Dev: `http://localhost:5678/webhook/chat-log-web-dev`
- App Dev: `http://localhost:5678/webhook/chat-log-app-dev`
- Image Processing: `http://localhost:5678/webhook/chat-log-image-processing`
- Video Services: `http://localhost:5678/webhook/chat-log-video-services`

**Generate Requirements :**
- Web Dev: `http://localhost:5678/webhook/generate-requirements-web-dev`
- App Dev: `http://localhost:5678/webhook/generate-requirements-app-dev`
- Image Processing: `http://localhost:5678/webhook/generate-requirements-image-processing`
- Video Services: `http://localhost:5678/webhook/generate-requirements-video-services`

---

## 🔍 Dépannage

### n8n ne démarre pas
```bash
# Vérifier les logs
docker-compose logs n8n

# Vérifier que PostgreSQL est démarré
docker-compose ps
```

### Impossible de se connecter à PostgreSQL depuis n8n
- Vérifiez que le host est bien `postgres` (nom du service Docker)
- Vérifiez que PostgreSQL est démarré : `docker-compose ps`

### Les workflows ne s'activent pas
- Vérifiez que les credentials sont bien configurés
- Vérifiez les logs d'exécution dans n8n

---

## 🎯 Prochaines Étapes

1. ✅ Démarrer n8n : `docker-compose up -d`
2. ✅ Se connecter : http://localhost:5678
3. ✅ Importer les 8 workflows
4. ✅ Configurer les credentials (PostgreSQL + OpenAI)
5. ✅ Activer tous les workflows
6. ✅ Tester avec curl
7. ✅ Mettre à jour `front/constants.ts` avec les URLs locales
