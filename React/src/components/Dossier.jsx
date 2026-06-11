import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Projet from './Projet';
import DetaillerProjet from './DetaillerProjet';
import { getProjets, deleteProjet, updateProjet } from '../api';

const Dossier = ({ toast }) => {
  const [projets, setProjets]           = useState([]);
  const [recherche, setRecherche]       = useState('');
  const [projetDetail, setProjetDetail] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const chargerProjets = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const res = await getProjets();
      setProjets(res.data);
    } catch {
      setError('Impossible de charger les projets. Vérifiez que le serveur Express tourne sur le port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { chargerProjets(); }, [chargerProjets]);

  const handleSupprimer = async (id) => {
    if (!globalThis.confirm('Supprimer ce projet définitivement ?')) return;
    try {
      await deleteProjet(id);
      setProjets(prev => prev.filter(p => p.id !== id));
      toast('Projet supprimé avec succès', 'success');
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const handleEditer = async (updated) => {
    try {
      await updateProjet(updated.id, updated);
      setProjets(prev => prev.map(p => p.id === updated.id ? updated : p));
      setProjetDetail(updated);
      toast('Projet mis à jour avec succès', 'success');
    } catch {
      toast('Erreur lors de la mise à jour', 'error');
    }
  };

  const projetsFiltres = projets.filter(p =>
    p.nom?.toLowerCase().includes(recherche.toLowerCase()) ||
    p.description?.toLowerCase().includes(recherche.toLowerCase()) ||
    p.technologies?.some(t => t.toLowerCase().includes(recherche.toLowerCase()))
  );

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      <p>Chargement des projets…</p>
    </div>
  );

  return (
    <div className="dossier-section">
      <div className="dossier-header">
        <div>
          <span className="section-label">Portfolio</span>
          <h2 className="section-title">Mes Projets</h2>
        </div>
      </div>

      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Rechercher par nom, technologie…"
          value={recherche} onChange={e => setRecherche(e.target.value)} />
        {recherche && (
          <button className="search-clear" onClick={() => setRecherche('')}>✕</button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {projetsFiltres.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>{recherche ? 'Aucun résultat trouvé' : "Aucun projet pour l'instant"}</h3>
          <p>{recherche
            ? `Aucun projet ne correspond à "${recherche}"`
            : 'Aucun projet pour le moment. Veuillez consulter ultérieurement.'
          }</p>
        </div>
      ) : (
        <>
          <p className="result-count">
            {projetsFiltres.length} projet{projetsFiltres.length > 1 ? 's' : ''} trouvé{projetsFiltres.length > 1 ? 's' : ''}
          </p>
          <div className="projets-grid">
            {projetsFiltres.map(projet => (
              <Projet
                key={projet.id}
                projet={projet}
                onSupprimer={handleSupprimer}
                onDetail={setProjetDetail}
              />
            ))}
          </div>
        </>
      )}

      {projetDetail && (
        <DetaillerProjet
          projet={projetDetail}
          onAnnuler={() => setProjetDetail(null)}
          onEditer={handleEditer}
        />
      )}
    </div>
  );
};

export default Dossier;

Dossier.propTypes = {
  toast: PropTypes.func.isRequired,
};
