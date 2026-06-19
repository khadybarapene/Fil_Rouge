const request  = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app      = require('../app');

let mongoServer;

const projetValide = {
  title:        'Mon Portfolio React',
  description:  'Application web portfolio développée avec React et Node.js',
  technologies: ['React', 'Node.js', 'MongoDB'],
  githubUrl:    'https://github.com/khadybarapene/portfolio',
  status:       'terminé',
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── TEST 1 : Health Check ────────────────────────────────────────
describe('GET / — Health Check', () => {
  it('devrait retourner le statut de lAPI', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ── TEST 2 : Créer un projet ─────────────────────────────────────
describe('POST /api/projects', () => {
  it('devrait créer un projet valide', async () => {
    const res = await request(app).post('/api/projects').send(projetValide);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(projetValide.title);
  });

  it('devrait refuser sans titre', async () => {
    const res = await request(app).post('/api/projects').send({ description: 'Sans titre' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devrait refuser sans description', async () => {
    const res = await request(app).post('/api/projects').send({ title: 'Sans description' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ── TEST 3 : Récupérer tous les projets ──────────────────────────
describe('GET /api/projects', () => {
  it('devrait retourner liste vide', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('devrait retourner les projets créés', async () => {
    await request(app).post('/api/projects').send(projetValide);
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

// ── TEST 4 : Récupérer par ID ────────────────────────────────────
describe('GET /api/projects/:id', () => {
  it('devrait retourner un projet existant', async () => {
    const created = await request(app).post('/api/projects').send(projetValide);
    const id = created.body.data._id;
    const res = await request(app).get(`/api/projects/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it('devrait retourner 404 pour ID inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/projects/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('devrait retourner 400 pour ID invalide', async () => {
    const res = await request(app).get('/api/projects/id-invalide');
    expect(res.status).toBe(400);
  });
});

// ── TEST 5 : Mettre à jour ───────────────────────────────────────
describe('PUT /api/projects/:id', () => {
  it('devrait mettre à jour un projet', async () => {
    const created = await request(app).post('/api/projects').send(projetValide);
    const id = created.body.data._id;
    const res = await request(app).put(`/api/projects/${id}`).send({ title: 'Titre modifié', status: 'archivé' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Titre modifié');
    expect(res.body.data.status).toBe('archivé');
  });

  it('devrait retourner 404 pour ID inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/projects/${fakeId}`).send({ title: 'Test' });
    expect(res.status).toBe(404);
  });
});

// ── TEST 6 : Supprimer ───────────────────────────────────────────
describe('DELETE /api/projects/:id', () => {
  it('devrait supprimer un projet', async () => {
    const created = await request(app).post('/api/projects').send(projetValide);
    const id = created.body.data._id;
    const res = await request(app).delete(`/api/projects/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const check = await request(app).get(`/api/projects/${id}`);
    expect(check.status).toBe(404);
  });

  it('devrait retourner 404 pour ID inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/projects/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
