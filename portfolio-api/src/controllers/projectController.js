// src/controllers/projectController.js
// Module Controller — Logique métier pour la gestion des projets

const Project = require('../models/Project');

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaire : réponse d'erreur normalisée
// ─────────────────────────────────────────────────────────────────────────────
const sendError = (res, statusCode, message, details = null) => {
  const payload = { success: false, message };
  if (details) payload.errors = details;
  return res.status(statusCode).json(payload);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects
// Ajouter un nouveau projet
// ─────────────────────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl, imageUrl, status, startDate, endDate } = req.body;

    // Vérification des champs obligatoires
    if (!title || !description) {
      return sendError(res, 400, 'Les champs title et description sont obligatoires');
    }

    // Création du projet
    const project = await Project.create({
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status,
      startDate,
      endDate,
    });

    return res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: project,
    });
  } catch (error) {
    // Erreur de duplication (titre déjà existant)
    if (error.code === 11000) {
      return sendError(res, 409, `Un projet avec le titre "${req.body.title}" existe déjà`);
    }
    // Erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendError(res, 400, 'Données invalides', messages);
    }
    console.error('createProject :', error);
    return sendError(res, 500, 'Erreur interne du serveur');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects
// Retourner tous les projets (avec pagination et filtres optionnels)
// ─────────────────────────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    // ── Filtres de requête ──────────────────────────────────────────────────
    const filter = {};

    // Filtre par statut : GET /api/projects?status=terminé
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Recherche textuelle : GET /api/projects?search=React
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // ── Pagination ──────────────────────────────────────────────────────────
    const page  = Math.max(1, Number.parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Number.parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    // ── Tri : GET /api/projects?sort=-createdAt ─────────────────────────────
    const sort = req.query.sort || '-createdAt'; // tri décroissant par défaut

    // ── Requête ─────────────────────────────────────────────────────────────
    const [projects, total] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: projects,
    });
  } catch (error) {
    console.error('getAllProjects :', error);
    return sendError(res, 500, 'Erreur interne du serveur');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/:id
// Retourner toutes les informations d'un projet donné
// ─────────────────────────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 404, `Aucun projet trouvé avec l'id : ${req.params.id}`);
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    // ID MongoDB mal formé
    if (error.name === 'CastError') {
      return sendError(res, 400, `L'identifiant "${req.params.id}" n'est pas valide`);
    }
    console.error('getProjectById :', error);
    return sendError(res, 500, 'Erreur interne du serveur');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/projects/:id
// Modifier les informations d'un projet donné
// ─────────────────────────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    // Champs autorisés à la mise à jour
    const allowedFields = [
      'title', 'description', 'technologies',
      'githubUrl', 'liveUrl', 'imageUrl',
      'status', 'startDate', 'endDate',
    ];

    // Filtrer les champs non autorisés
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, 'Aucune donnée valide fournie pour la mise à jour');
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,           // retourner le document mis à jour
        runValidators: true, // appliquer les validations du schéma
      }
    );

    if (!project) {
      return sendError(res, 404, `Aucun projet trouvé avec l'id : ${req.params.id}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, `L'identifiant "${req.params.id}" n'est pas valide`);
    }
    if (error.code === 11000) {
      return sendError(res, 409, `Un projet avec ce titre existe déjà`);
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return sendError(res, 400, 'Données invalides', messages);
    }
    console.error('updateProject :', error);
    return sendError(res, 500, 'Erreur interne du serveur');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/projects/:id
// Supprimer un projet
// ─────────────────────────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return sendError(res, 404, `Aucun projet trouvé avec l'id : ${req.params.id}`);
    }

    return res.status(200).json({
      success: true,
      message: `Le projet "${project.title}" a été supprimé avec succès`,
      data: null,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return sendError(res, 400, `L'identifiant "${req.params.id}" n'est pas valide`);
    }
    console.error('deleteProject :', error);
    return sendError(res, 500, 'Erreur interne du serveur');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Export des contrôleurs
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};