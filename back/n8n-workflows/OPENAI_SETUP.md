# Guide : Configurer les Credentials OpenAI dans n8n

## 📋 Prérequis

Vous devez avoir :
1. ✅ n8n démarré et accessible sur http://localhost:5678
2. ✅ Un compte OpenAI (gratuit ou payant)

---

## 🔑 Étape 1 : Obtenir votre Clé API OpenAI

### 1.1 Créer/Se connecter à votre compte OpenAI
1. Allez sur **https://platform.openai.com**
2. Cliquez sur **"Sign up"** (ou **"Log in"** si vous avez déjà un compte)
3. Complétez l'inscription si nécessaire

### 1.2 Générer une Clé API
1. Une fois connecté, allez sur **https://platform.openai.com/api-keys**
2. Cliquez sur **"+ Create new secret key"**
3. Donnez un nom à votre clé (ex: "n8n-devflow-concierge")
4. Cliquez sur **"Create secret key"**
5. **⚠️ IMPORTANT :** Copiez immédiatement la clé affichée
   - Elle commence par `sk-...`
   - Elle ne sera affichée qu'une seule fois !
   - Sauvegardez-la dans un endroit sûr

**Exemple de clé :** `sk-proj-abc123def456...` (ne partagez jamais votre vraie clé)

### 1.3 Vérifier votre Crédit (Optionnel)
1. Allez sur **https://platform.openai.com/usage**
2. Vérifiez que vous avez du crédit disponible
3. Si nécessaire, ajoutez un moyen de paiement dans **Settings → Billing**

---

## 🔧 Étape 2 : Ajouter le Credential dans n8n

### 2.1 Accéder à la Section Credentials
1. Ouvrez n8n : **http://localhost:5678**
2. Connectez-vous avec :
   - Username: `admin`
   - Password: `admin123`
3. Dans le menu de gauche, cliquez sur **"Credentials"** (icône de clé 🔑)

### 2.2 Créer un Nouveau Credential OpenAI
1. Cliquez sur le bouton **"Add Credential"** (en haut à droite)
2. Dans la barre de recherche, tapez **"OpenAI"**
3. Cliquez sur **"OpenAI"** dans les résultats

### 2.3 Configurer le Credential
Remplissez les champs suivants :

**Credential Name (optionnel) :**
```
OpenAI - DevFlow Concierge
```

**API Key :** (obligatoire)
```
sk-proj-votre-clé-ici...
```
👆 Collez la clé que vous avez copiée à l'étape 1.2

**Organization ID :** (optionnel)
```
[Laissez vide sauf si vous avez une organisation spécifique]
```

### 2.4 Tester la Connexion
1. Cliquez sur le bouton **"Test"** (si disponible)
2. Si le test réussit, vous verrez un message de succès ✅
3. Cliquez sur **"Save"** pour enregistrer le credential

---

## 🔗 Étape 3 : Assigner le Credential aux Workflows

Vous devez maintenant assigner ce credential aux 4 workflows `generate-requirements-*`.

### Pour chaque workflow :

#### 3.1 Ouvrir le Workflow
1. Cliquez sur **"Workflows"** dans le menu de gauche
2. Ouvrez le workflow (ex: `Generate Requirements - Web Development`)

#### 3.2 Configurer le Node "Call AI to Summarize"
1. Cliquez sur le node **"Call AI to Summarize"** (node HTTP Request)
2. Dans le panneau de droite, section **"Credential to connect with"**
3. Cliquez sur le menu déroulant
4. Sélectionnez **"OpenAI - DevFlow Concierge"** (ou le nom que vous avez donné)

#### 3.3 Sauvegarder
1. Cliquez sur **"Save"** en haut à droite du workflow
2. Le workflow est maintenant configuré ! ✅

### Répétez pour les 4 workflows :
- ✅ `generate-requirements-web-dev.json`
- ✅ `generate-requirements-app-dev.json`
- ✅ `generate-requirements-image-processing.json`
- ✅ `generate-requirements-video-services.json`

---

## ✅ Étape 4 : Vérification

### 4.1 Tester un Workflow
1. Ouvrez un workflow `generate-requirements-*`
2. Cliquez sur **"Execute Workflow"** (bouton play ▶️)
3. Le workflow devrait s'exécuter sans erreur

### 4.2 Test avec un Webhook
```bash
curl -X POST http://localhost:5678/webhook/generate-requirements-web-dev \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-openai-123",
    "company_name": "Test Company",
    "phone": "+33123456789",
    "messages": [
      {"role": "user", "content": "I need an e-commerce website with payment integration"},
      {"role": "model", "content": "What payment providers do you prefer?"},
      {"role": "user", "content": "Stripe and PayPal"}
    ]
  }'
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "service": "WEB_DEV",
  "session_id": "test-openai-123"
}
```

### 4.3 Vérifier dans la Base de Données
```bash
docker-compose exec postgres psql -U devflow -d devflow_db -c "SELECT * FROM requirements ORDER BY created_at DESC LIMIT 1;"
```

Vous devriez voir le document de requirements généré par l'IA !

---

## 🔍 Dépannage

### ❌ Erreur : "Invalid API Key"
**Solution :**
- Vérifiez que vous avez bien copié la clé complète (commence par `sk-`)
- Générez une nouvelle clé sur https://platform.openai.com/api-keys
- Mettez à jour le credential dans n8n

### ❌ Erreur : "Insufficient quota"
**Solution :**
- Vérifiez votre crédit sur https://platform.openai.com/usage
- Ajoutez un moyen de paiement dans Settings → Billing
- Ou utilisez une clé avec du crédit disponible

### ❌ Le workflow ne trouve pas le credential
**Solution :**
- Vérifiez que vous avez bien sauvegardé le credential
- Ouvrez le workflow et réassignez le credential au node "Call AI to Summarize"
- Sauvegardez le workflow

### ❌ Erreur : "Rate limit exceeded"
**Solution :**
- Vous avez fait trop de requêtes trop rapidement
- Attendez quelques minutes
- Considérez upgrader votre plan OpenAI pour des limites plus élevées

---

## 💡 Conseils

### Sécurité
- ⚠️ Ne partagez JAMAIS votre clé API
- ⚠️ Ne commitez pas votre clé dans Git
- ✅ Utilisez des clés différentes pour dev/prod
- ✅ Supprimez les clés inutilisées

### Coûts
- Le modèle `gpt-4` coûte environ $0.03 par 1K tokens
- Pour économiser, vous pouvez utiliser `gpt-3.5-turbo` (moins cher)
- Surveillez votre usage sur https://platform.openai.com/usage

### Modifier le Modèle (Optionnel)
Pour changer de modèle GPT dans vos workflows :
1. Ouvrez le workflow
2. Cliquez sur le node **"Call AI to Summarize"**
3. Dans les paramètres, cherchez `"model": "gpt-4"`
4. Changez pour `"gpt-3.5-turbo"` ou `"gpt-4-turbo"`
5. Sauvegardez

---

## 📚 Ressources

- **Documentation OpenAI :** https://platform.openai.com/docs
- **Tarifs OpenAI :** https://openai.com/pricing
- **Documentation n8n OpenAI :** https://docs.n8n.io/integrations/builtin/credentials/openai/
- **Support OpenAI :** https://help.openai.com

---

## ✨ Résumé

1. ✅ Obtenir une clé API sur https://platform.openai.com/api-keys
2. ✅ Dans n8n : Credentials → Add Credential → OpenAI
3. ✅ Coller la clé API et sauvegarder
4. ✅ Assigner le credential aux 4 workflows `generate-requirements-*`
5. ✅ Tester avec un webhook

**Vous êtes prêt ! 🎉**
