# --- Étape de Build ---
# Utiliser une image Node complète pour installer les dépendances
FROM node:20-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendance (package.json et package-lock.json)
# Cela permet d'utiliser le cache Docker si seulement le code change, mais pas les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# -----------------------------------
# --- Étape de Production Finale ---
# Utiliser une image Node plus petite pour l'exécution (moins de surface d'attaque, image plus légère)
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier SEULEMENT ce qui est nécessaire pour l'exécution depuis l'étape de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Le port sur lequel l'API Express écoute (par convention 5000 pour le back-end)
EXPOSE 5000

# Commande pour démarrer le serveur (doit correspondre au script 'start' de votre package.json)
CMD ["npm", "start"]