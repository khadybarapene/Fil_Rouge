// src/routes/projectRoutes.js
// Module Routes — Définition des routes de l'API Portfolio

const express = require('express');
const router  = express.Router();

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// ─────────────────────────────────────────────────────────────────────────────
//  Routes de la ressource "projects"
//
//  Méthode  | URL                    | Action
//  ---------|------------------------|----------------------------------------
//  POST     | /api/projects          | Créer un nouveau projet
//  GET      | /api/projects          | Récupérer tous les projets
//  GET      | /api/projects/:id      | Récupérer un projet par son ID
//  PUT      | /api/projects/:id      | Mettre à jour un projet
//  DELETE   | /api/projects/:id      | Supprimer un projet
// ─────────────────────────────────────────────────────────────────────────────

// Route de base  →  /api/projects
router
  .route('/')
  .post(createProject)   // POST   /api/projects
  .get(getAllProjects);   // GET    /api/projects

// Routes avec paramètre  →  /api/projects/:id
router
  .route('/:id')
  .get(getProjectById)   // GET    /api/projects/:id
  .put(updateProject)    // PUT    /api/projects/:id
  .delete(deleteProject); // DELETE /api/projects/:id

module.exports = router;