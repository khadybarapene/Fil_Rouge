# 🚀 Portfolio — Khady PENE

## Démarrage en local

### 1. Backend Express (Terminal 1)
```bash
cd portfolio-api
npm install
npm start
# → Serveur sur http://localhost:5000
```

### 2. Frontend React (Terminal 2)
```bash
cd portfolio-react
npm install
npm start
# → Application sur http://localhost:3000
```

## Prérequis
- Node.js installé
- MongoDB installé et démarré (`mongod`)

## Endpoints API
| Méthode | URL                   | Action                    |
|---------|-----------------------|---------------------------|
| GET     | /api/projects         | Récupérer tous les projets|
| POST    | /api/projects         | Créer un projet           |
| GET     | /api/projects/:id     | Récupérer un projet       |
| PUT     | /api/projects/:id     | Modifier un projet        |
| DELETE  | /api/projects/:id     | Supprimer un projet       |
| GET     | /metrics              | Exposer les métriques Prometheus |

## 7. Monitoring Prometheus & Grafana

### 7.1. Problématique
Une application conteneurisée doit être observable : disponibilité de l'API, nombre de requêtes, temps de réponse, consommation CPU/RAM et état des cibles à surveiller. Sans monitoring, les erreurs ne sont vues qu'après un retour utilisateur ou un incident.

### 7.2. Présentation
Prometheus collecte les métriques exposées par les services. Grafana se connecte à Prometheus comme source de données et transforme ces métriques en tableaux de bord.

### 7.3. Concepts
- Target : service surveillé par Prometheus, par exemple `api:5000`, `node-exporter:9100` ou `prometheus:9090`.
- Métriques : séries temporelles exposées par `/metrics`, comme `portfolio_api_http_requests_total`.
- Exporter : composant qui expose des métriques pour un système. Ici `node-exporter` expose les métriques système.
- Source de données : connexion Grafana vers Prometheus, provisionnée dans `grafana/provisioning/datasources/prometheus.yml`.
- Dashboard : visualisation Grafana provisionnée dans `grafana/provisioning/dashboards/portfolio-observability.json`.
- Alertes et notifications : Grafana peut déclencher des alertes depuis les requêtes PromQL et notifier par email, Slack, webhook, etc.

### 7.4. Architecture
```text
React :3000 -> API Express :5000 -> MongoDB :27017
                      |
                      v
                  /metrics
                      |
Prometheus :9090 <----+---- node-exporter :9100
      |
      v
Grafana :3001
```

### 7.5. Installation
```bash
docker compose up -d --build
```

Accès :
- Application React : http://localhost:3000
- API : http://localhost:5000
- Métriques API : http://localhost:5000/metrics
- Prometheus : http://localhost:9090
- Grafana : http://localhost:3001 avec `admin` / `admin`

### 7.6. Démo
1. Démarrer la stack avec `docker compose up -d --build`.
2. Ouvrir Prometheus puis vérifier `Status > Targets`.
3. Appeler l'API plusieurs fois, par exemple `curl http://localhost:5000/api/projects`.
4. Tester une requête PromQL : `sum(rate(portfolio_api_http_requests_total[1m]))`.
5. Ouvrir Grafana et consulter le dashboard `Portfolio Observability`.

### 7.7. Références
- Documentation Prometheus : https://prometheus.io/docs/introduction/overview/
- Documentation prom-client : https://github.com/siimon/prom-client
- Documentation Grafana provisioning : https://grafana.com/docs/grafana/latest/administration/provisioning/
- Documentation node-exporter : https://github.com/prometheus/node_exporter

## 8. Construction avec Jenkins

Le fichier `Jenkinsfile` construit maintenant le projet complet :
- installation et tests du backend Express ;
- installation et tests du frontend React ;
- validation de `docker-compose.yml`, Prometheus et Grafana ;
- analyse SonarQube ;
- build Docker des images `portfolio-api` et `portfolio-react` ;
- push DockerHub avec deux tags : `latest` et numéro de build Jenkins ;
- démarrage local de la stack `mongo`, `api`, `react`, `node-exporter`, `prometheus`, `grafana` ;
- déploiement Kubernetes avec les images taguées par le numéro du build.

### Credentials Jenkins nécessaires
- `dockerhub-credentials` : identifiant/mot de passe DockerHub.
- `sonar-api` : token SonarQube du backend.
- `sonar-react` : token SonarQube du frontend.
- `aws-access-key` : clé AWS.
- `aws-secret-key` : secret AWS.

### Lancement
Créer un pipeline Jenkins depuis le dépôt Git, choisir `Pipeline script from SCM`, puis indiquer le chemin `Jenkinsfile`.

Après un build réussi :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- Prometheus : http://localhost:9090
- Grafana : http://localhost:3001
- SonarQube : http://localhost:9000
