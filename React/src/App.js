import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Dossier from './components/Dossier';
import AjouterProjet from './components/AjouterProjet';
import { addProjet, getProjets } from './api';
import './App.css';

// ═══════════════════════════════════════════════════
// ACCUEIL
// ═══════════════════════════════════════════════════
const Accueil = ({ onNavigateProjets }) => {
  const [stats, setStats] = useState({ projets: 0, technologies: 0 });

  useEffect(() => {
    getProjets().then(res => {
      const projets = res.data;
      const toutesLesTechs = new Set(
        projets.flatMap(p => p.technologies || []).map(t => t.trim().toLowerCase())
      );
      setStats({ projets: projets.length, technologies: toutesLesTechs.size });
    }).catch(() => {});
  }, []);

  return (
    <div className="accueil">

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-label">Portfolio 2024</p>
            <h1 className="hero-title">
              <span className="gradient-text">Créer.</span>
              <span className="accent-text">Innover.</span>
              <span className="muted-text">Livrer.</span>
            </h1>
            <p className="hero-sub">
              Développeuse passionnée spécialisée en web, mobile et design.
              Je transforme vos idées en expériences digitales mémorables.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={onNavigateProjets}>
                Voir mes projets →
              </button>
              <a href="mailto:khadypene267@gmail.com" className="btn-ghost">
                Me contacter
              </a>
            </div>
          </div>

          <div className="hero-avatar-block">
            <div className="hero-avatar">KP</div>
            <div className="hero-badge">
              <p className="hero-badge-count">{stats.projets}+ projets</p>
              <p className="hero-badge-label">réalisés</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <p className="stat-num accent">{stats.projets}+</p>
            <p className="stat-label">Projets réalisés</p>
          </div>
          <div className="stat-item">
            <p className="stat-num accent">{stats.technologies}+</p>
            <p className="stat-label">Technologies</p>
          </div>
          <div className="stat-item">
            <p className="stat-num gold">∞</p>
            <p className="stat-label">Passion</p>
          </div>
        </div>
      </div>

      {/* ── ABOUT + SKILLS ── */}
      <div className="about-grid">
        <div className="card about-card">
          <div className="card-header">
            <div className="section-line" />
            <h2 className="card-title">À propos de moi</h2>
          </div>
          <p className="card-text">
            Je suis une développeuse passionnée avec une expérience dans la création
            de sites web, d'applications mobiles et de designs innovants. Mon objectif
            est de créer des expériences utilisateur exceptionnelles grâce à des
            solutions techniques efficaces et élégantes.
          </p>
        </div>

        <div className="card skills-card">
          <div className="card-header">
            <div className="section-line" />
            <h2 className="card-title">Compétences</h2>
          </div>
          <div className="skills-section">
            <p className="skills-cat">Web</p>
            <div className="skills-list">
              {['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'].map(s => (
                <span key={s} className="skill-badge">{s}</span>
              ))}
            </div>
          </div>
          <div className="skills-section">
            <p className="skills-cat">Mobile</p>
            <div className="skills-list">
              {['Flutter', 'React Native'].map(s => (
                <span key={s} className="skill-badge">{s}</span>
              ))}
            </div>
          </div>
          <div className="skills-section">
            <p className="skills-cat">Design</p>
            <div className="skills-list">
              {['Figma', 'Adobe XD'].map(s => (
                <span key={s} className="skill-badge">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

Accueil.propTypes = {
  onNavigateProjets: PropTypes.func.isRequired,
};

// ═══════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════
const Contact = ({ toast }) => {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    toast('Message envoyé avec succès !', 'success');
    setForm({ nom: '', email: '', sujet: '', message: '' });
  };

  return (
    <div className="contact-section">
      <div className="section-header">
        <span className="section-label">Discutons</span>
        <h2 className="section-title">Me contacter</h2>
      </div>

      <div className="form-card">
        <div onSubmit={handleSubmit}>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="contact-nom" className="field-label">Nom</label>
              <input id="contact-nom" name="nom" className="field-input" placeholder="Votre nom"
                value={form.nom} onChange={handleChange} />
            </div>
            <div className="field-group">
              <label htmlFor="contact-email" className="field-label">Email</label>
              <input id="contact-email" name="email" type="email" className="field-input"
                placeholder="vous@exemple.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="contact-sujet" className="field-label">Sujet</label>
            <input id="contact-sujet" name="sujet" className="field-input"
              placeholder="Ex: Proposition de collaboration"
              value={form.sujet} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label htmlFor="contact-message" className="field-label">Message</label>
            <textarea id="contact-message" name="message" className="field-input field-textarea" rows={6}
              placeholder="Décrivez votre projet ou votre demande…"
              value={form.message} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              Envoyer le message
            </button>
            <button type="button" className="btn-ghost"
              onClick={() => setForm({ nom: '', email: '', sujet: '', message: '' })}>
              Effacer
            </button>
          </div>
        </div>
      </div>

      <div className="contact-info-card">
        <span className="contact-info-icon">⚡</span>
        <div>
          <p className="contact-info-title">Réponse rapide</p>
          <p className="contact-info-sub">
            Je réponds généralement dans les 24h. Vous pouvez aussi m'écrire à{' '}
            <a href="mailto:khadypene267@gmail.com" className="contact-email">
              khadypene267@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

Contact.propTypes = {
  toast: PropTypes.func.isRequired,
};

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
const Toast = ({ msg, type, visible }) => (
  <div className={`toast ${type} ${visible ? 'toast-visible' : ''}`}>
    <span>{type === 'success' ? '✓' : '✕'}</span> {msg}
  </div>
);

Toast.propTypes = {
  msg:     PropTypes.string.isRequired,
  type:    PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
};

// ═══════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════
const TABS = ['Accueil', 'Projets', 'Ajouter', 'Contact'];

export default function App() {
  const [activeTab, setActiveTab]   = useState('Accueil');
  const [toast, setToast]           = useState({ msg: '', type: 'success', visible: false });
  const [dossierKey, setDossierKey] = useState(0);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  const handleAjouterProjet = async (data) => {
    try {
      await addProjet(data);
      showToast('Projet ajouté avec succès !', 'success');
      setDossierKey(k => k + 1);
      setActiveTab('Projets');
    } catch {
      showToast("Erreur lors de l'ajout", 'error');
    }
  };

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="avatar-ring">
              <div className="avatar">KP</div>
              <div className="online-dot" />
            </div>
            <div>
              <p className="brand-name">Khady PENE</p>
              <p className="brand-role">Développeuse Full Stack</p>
            </div>
          </div>

          <nav className="nav">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── TOAST ── */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />

      {/* ── MAIN ── */}
      <main className="main">
        {activeTab === 'Accueil' && (
          <Accueil onNavigateProjets={() => setActiveTab('Projets')} />
        )}
        {activeTab === 'Projets' && (
          <Dossier
            key={dossierKey}
            toast={showToast}
          />
        )}
        {activeTab === 'Ajouter' && (
          <AjouterProjet
            onAjouter={handleAjouterProjet}
            onCancel={() => setActiveTab('Projets')}
          />
        )}
        {activeTab === 'Contact' && (
          <Contact toast={showToast} />
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-avatar">KP</div>
            <span className="footer-name">Khady PENE</span>
          </div>
          <p className="footer-copy">© 2026 Portfolio Khady PENE — Tous droits réservés</p>
          <div className="footer-links">
            <a href="https://github.com/khadybarapene" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="footer-link">LinkedIn</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
