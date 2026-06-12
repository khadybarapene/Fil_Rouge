# k8s.tf
# Déploiement de l'app portfolio sur EKS
# On réutilise exactement les mêmes fichiers YAML du dossier k8s/

resource "kubectl_manifest" "namespace" {
  yaml_body  = file("../k8s/namespace.yaml")
  depends_on = [module.eks]
}

resource "kubectl_manifest" "configmap" {
  yaml_body  = file("../k8s/configmap.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "secret" {
  yaml_body  = file("../k8s/secret.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "mongo_service" {
  yaml_body  = file("../k8s/mongo/service.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "mongo_statefulset" {
  yaml_body  = file("../k8s/mongo/statefulset.yaml")
  depends_on = [kubectl_manifest.mongo_service, kubectl_manifest.secret]
}

resource "kubectl_manifest" "api_service" {
  yaml_body  = file("../k8s/api/service.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "api_deployment" {
  yaml_body  = file("../k8s/api/deployment.yaml")
  depends_on = [kubectl_manifest.mongo_statefulset, kubectl_manifest.configmap]
}

resource "kubectl_manifest" "react_service" {
  yaml_body  = file("../k8s/react/service.yaml")
  depends_on = [kubectl_manifest.namespace]
}

resource "kubectl_manifest" "react_deployment" {
  yaml_body  = file("../k8s/react/deployment.yaml")
  depends_on = [kubectl_manifest.api_service]
}

resource "kubectl_manifest" "ingress" {
  yaml_body  = file("../k8s/ingress.yaml")
  depends_on = [kubectl_manifest.api_service, kubectl_manifest.react_service]
}
