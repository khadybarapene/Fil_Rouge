// src/models/Project.js
// Module Model — Schéma Mongoose pour un projet de portfolio

const mongoose = require('mongoose');

/**
 * Schéma d'un projet de portfolio.
 *
 * Champs :
 *  - title       : Titre du projet (obligatoire, unique)
 *  - description : Description détaillée du projet
 *  - technologies: Liste des technologies utilisées
 *  - githubUrl   : Lien vers le dépôt GitHub
 *  - liveUrl     : Lien vers la démo en ligne
 *  - imageUrl    : URL de l'image de couverture
 *  - status      : Statut du projet (en cours / terminé / archivé)
 *  - startDate   : Date de début
 *  - endDate     : Date de fin (null si en cours)
 *  - createdAt   : Date de création (auto)
 *  - updatedAt   : Date de mise à jour (auto)
 */
const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre du projet est obligatoire'],
      unique: true,
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },

    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },

    technologies: {
      type: [String],
      default: [],
      // Ex : ['React', 'Node.js', 'MongoDB']
    },

    githubUrl: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?github\.com\/.+/,
        'Veuillez fournir une URL GitHub valide',
      ],
      default: null,
    },

    liveUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Veuillez fournir une URL valide'],
      default: null,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['en_cours', 'terminé', 'archivé'],
        message: 'Le statut doit être : en_cours, terminé ou archivé',
      },
      default: 'en_cours',
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
    // Transforme _id en id dans les réponses JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index de recherche textuelle ───────────────────────────────────────────
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

// ─── Export du modèle ────────────────────────────────────────────────────────
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;