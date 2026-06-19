# 🚀 Portfolio — Khady PENE

## Démarrage en local

### 1. Backend Express (Terminal 1)
```bash
cd portfolio-api
npm install
npm start
# → Serveur sur http://localhost:5000
```

### 2. Frontend React (Terminal 2)
```bash
cd portfolio-react
npm install
npm start
# → Application sur http://localhost:3000
```

## Prérequis
- Node.js installé
- MongoDB installé et démarré (`mongod`)

## Endpoints API
| Méthode | URL                   | Action                    |
|---------|-----------------------|---------------------------|
| GET     | /api/projects         | Récupérer tous les projets|
| POST    | /api/projects         | Créer un projet           |
| GET     | /api/projects/:id     | Récupérer un projet       |
| PUT     | /api/projects/:id     | Modifier un projet        |
| DELETE  | /api/projects/:id     | Supprimer un projet       |
