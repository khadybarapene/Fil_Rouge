import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/projects';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// React → Express (nom → title, lien → githubUrl, etc.)
const toAPI = (projet) => ({
  title:        projet.nom,
  description:  projet.description,
  technologies: projet.technologies || [],
  githubUrl:    projet.lien || null,
  imageUrl:     projet.image || null,
  status:       projet.status || 'terminé',
  startDate:    projet.date || new Date().toISOString(),
});

// Express → React (_id → id, title → nom, etc.)
const fromAPI = (p) => ({
  id:           p._id,
  nom:          p.title,
  description:  p.description,
  technologies: p.technologies || [],
  lien:         p.githubUrl || '',
  image:        p.imageUrl || '',
  date:         p.startDate || p.createdAt,
  status:       p.status,
});

export const getProjets   = () =>
  api.get('/').then(res => ({ ...res, data: res.data.data.map(fromAPI) }));

export const getProjet    = (id) =>
  api.get(`/${id}`).then(res => ({ ...res, data: fromAPI(res.data.data) }));

export const addProjet    = (projet) => api.post('/', toAPI(projet));

export const updateProjet = (id, projet) => api.put(`/${id}`, toAPI(projet));

export const deleteProjet = (id) => api.delete(`/${id}`);
