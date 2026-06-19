// src/app.js
// Point d'entrée de l'application — API REST Portfolio

// ── Chargement des variables d'environnement (.env) ──────────────────────────
require('dotenv').config();

const express    = require('express');
const client     = require('prom-client');
const connectDB  = require('./config/connectdb');
const projectRoutes = require('./routes/projectRoutes');

// ── Connexion à MongoDB ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ── Initialisation d'Express ─────────────────────────────────────────────────
const app = express();
app.disable('x-powered-by');

// ── Métriques Prometheus ─────────────────────────────────────────────────────
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'portfolio_api_' });

const httpRequestsTotal = new client.Counter({
  name: 'portfolio_api_http_requests_total',
  help: 'Nombre total de requetes HTTP recues par lAPI Portfolio',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'portfolio_api_http_request_duration_seconds',
  help: 'Duree des requetes HTTP recues par lAPI Portfolio',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

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

app.use((req, res, next) => {
  const endTimer = httpRequestDurationSeconds.startTimer();

  res.on('finish', () => {
    const route = req.route?.path || req.baseUrl || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Route de santé (health check)
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'API Portfolio operationnelle',
    version: '1.0.0',
    endpoints: {
      projects: '/api/projects',
      metrics: '/metrics',
    },
  });
});

app.get('/metrics', async (_req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    next(err);
  }
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nServeur demarre sur http://localhost:${PORT}`);
    console.log(`Environnement : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Base URL API  : http://localhost:${PORT}/api/projects`);
    console.log(`Metrics       : http://localhost:${PORT}/metrics\n`);
  });
}

module.exports = app;
