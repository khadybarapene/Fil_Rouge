// src/app.js
// Point d'entrée de l'application — API REST Portfolio

// ── Chargement des variables d'environnement (.env) ──────────────────────────
require('dotenv').config();

const express    = require('express');
const connectDB  = require('./config/connectdb');
const projectRoutes = require('./routes/projectRoutes');

// ── Connexion à MongoDB ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ── Initialisation d'Express ─────────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');

// ── Middlewares globaux ───────────────────────────────────────────────────────

// Parser JSON : lit le corps des requêtes en JSON
app.use(express.json());

// Parser URL-encoded : lit les données de formulaires HTML
app.use(express.urlencoded({ extended: true }));

// En-têtes CORS basiques (permet les appels depuis n'importe quelle origine)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Logger minimal des requêtes entrantes
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Route de santé (health check)
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 API Portfolio opérationnelle',
    version: '1.0.0',
    endpoints: {
      projects: '/api/projects',
    },
  });
});

// Routes des projets
app.use('/api/projects', projectRoutes);

// ── Gestion des routes inexistantes (404) ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// ── Gestion globale des erreurs (middleware d'erreur Express) ─────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Erreur non gérée :', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
});

// ── Démarrage du serveur ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🌐 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📦 Environnement : ${process.env.NODE_ENV || 'development'}`);
  console.log(`📌 Base URL API  : http://localhost:${PORT}/api/projects\n`);
});

module.exports = app;