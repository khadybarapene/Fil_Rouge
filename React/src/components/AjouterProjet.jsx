import React, { useState } from 'react';
import PropTypes from 'prop-types';

const AjouterProjet = ({ onAjouter, onCancel }) => {
  const [form, setForm] = useState({
    nom: '',
    description: '',
    technologies: ['', '', ''],
    image: '',
    lien: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleTech = (i, val) => {
    const techs = [...form.technologies];
    techs[i] = val;
    setForm({ ...form, technologies: techs });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setForm({ ...form, image: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = 'Le nom est requis.';
    if (!form.description.trim()) errs.description = 'La description est requise.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const payload = {
      ...form,
      technologies: form.technologies.filter(t => t.trim()),
      image: form.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80',
    };
    await onAjouter(payload);
    setForm({ nom: '', description: '', technologies: ['', '', ''], image: '', lien: '', date: new Date().toISOString().split('T')[0] });
    setImagePreview('');
    setLoading(false);
  };

  const handleReset = () => {
    setForm({ nom: '', description: '', technologies: ['', '', ''], image: '', lien: '', date: new Date().toISOString().split('T')[0] });
    setImagePreview('');
    setErrors({});
  };

  return (
    <div className="ajouter-section">
      <div className="section-header">
        <span className="section-label">Nouveau</span>
        <h2 className="section-title">Ajouter un projet</h2>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} noValidate>

          <div className="field-group">
            <label htmlFor="ajouter-nom" className="field-label">Nom du projet *</label>
            <input id="ajouter-nom" name="nom" className={`field-input ${errors.nom ? 'field-error' : ''}`}
              placeholder="Ex: Mon application web" value={form.nom} onChange={handleChange} />
            {errors.nom && <span className="error-msg">{errors.nom}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="ajouter-description" className="field-label">Description *</label>
            <textarea id="ajouter-description" name="description" className={`field-input field-textarea ${errors.description ? 'field-error' : ''}`}
              placeholder="Décrivez votre projet…" rows={4} value={form.description} onChange={handleChange} />
            {errors.description && <span className="error-msg">{errors.description}</span>}
          </div>

          <div className="field-group">
            <label htmlFor="tech-0" className="field-label">Technologies utilisées</label>
            {form.technologies.map((t, i) => {
              const placeholders = [
                'Principale (ex: React)',
                'Technologie 2 (ex: Node.js)',
                'Technologie 3 — optionnel',
              ];
              return (
                <input id={i === 0 ? 'tech-0' : undefined} key={placeholders[i]} className="field-input tech-input"
                  placeholder={placeholders[i]}
                  value={t} onChange={(e) => handleTech(i, e.target.value)} />
              );
            })}
          </div>

          <div className="field-group">
            <label htmlFor="ajouter-lien" className="field-label">Lien du projet</label>
            <input id="ajouter-lien" name="lien" className="field-input" placeholder="https://github.com/…" value={form.lien} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label htmlFor="ajouter-date" className="field-label">Date</label>
            <input id="ajouter-date" name="date" type="date" className="field-input" value={form.date} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label htmlFor="imgInput" className="field-label">Image du projet</label>
            <label className="img-dropzone" htmlFor="imgInput">
              <span className="img-icon">🖼️</span>
              <span className="img-hint">Cliquez pour choisir une image</span>
              <span className="img-sub">PNG, JPG, WEBP — max 5 MB</span>
              <input id="imgInput" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </label>
            {imagePreview && <img src={imagePreview} alt="Preview" className="img-preview" />}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ajout en cours…' : '+ Ajouter le projet'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleReset}>Réinitialiser</button>
            {onCancel && <button type="button" className="btn-ghost" onClick={onCancel}>Annuler</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterProjet;

AjouterProjet.propTypes = {
  onAjouter: PropTypes.func.isRequired,
  onCancel:  PropTypes.func,
};

AjouterProjet.defaultProps = {
  onCancel: null,
};