# Configuration du Webhook SonarQube vers Jenkins

## Problème identifié
Le pipeline Jenkins échoue lors de l'étape `waitForQualityGate` après un timeout de 10-15 minutes car SonarQube n'envoie pas le callback au webhook Jenkins.

## Solution: Configuration du Webhook

### 1. Accéder à SonarQube
- URL: http://localhost:9000
- Login: admin (identifiants par défaut)

### 2. Naviguer vers les webhooks
1. Cliquer sur **Administration** (icône engrenage)
2. Aller à **Configuration > Webhooks**
3. Cliquer sur **Create** 

### 3. Configurer le webhook
**Paramètres à remplir:**
- **Name**: Jenkins Callback
- **URL**: `http://jenkins:8080/generic-webhook-trigger/invoke`
  
  Ou si Jenkins est sur le même réseau Docker:
  - `http://host.docker.internal:8080/generic-webhook-trigger/invoke` (pour Mac/Windows)
  - Vérifier le hostname de Jenkins avec: `docker inspect -f '{{.Config.Hostname}}' <jenkins-container>`

- **Secret** (optionnel): Ajouter pour plus de sécurité

**Événements à sélectionner:**
- ✅ Quality Gate: Project Status Verification Passed
- ✅ Quality Gate: Project Status Verification Failed

### 4. Tester le webhook
Dans SonarQube (Administration > Webhooks):
- Cliquer sur les **...** du webhook
- Sélectionner **Deliver** pour tester

## Alternative: Utiliser waitForQualityGate avec skipFailure

Si la configuration du webhook n'est pas possible, modifier le Jenkinsfile:

```groovy
timeout(time: 15, unit: 'MINUTES') {
    waitForQualityGate abortPipeline: false, skipFailure: true
}
```

Cela permet au pipeline de continuer même si la quality gate échoue.

## Vérifier la connectivité Docker

```bash
# Depuis Jenkins container
docker exec <jenkins-container> curl -v http://sonarqube:9000

# Depuis SonarQube container  
docker exec sonarqube curl -v http://host.docker.internal:8080
```

## Debugging

Vérifier les logs SonarQube pour les erreurs de webhook:
```bash
docker logs sonarqube | grep -i webhook
```

Vérifier les logs Jenkins pour recevoir le webhook:
```bash
docker logs jenkins | grep -i webhook
```
