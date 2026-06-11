output "namespace" {
  description = "Namespace créé"
  value       = kubernetes_namespace.portfolio.metadata[0].name
}

output "api_service" {
  description = "Service de l'API"
  value       = kubernetes_service.api.metadata[0].name
}

output "react_service" {
  description = "Service du frontend"
  value       = kubernetes_service.react.metadata[0].name
}

output "mongo_service" {
  description = "Service MongoDB (headless)"
  value       = kubernetes_service.mongo.metadata[0].name
}

output "ingress_host" {
  description = "Hôte de l'Ingress"
  value       = kubernetes_ingress_v1.portfolio.spec[0].rule[0].host
}

output "api_image" {
  description = "Image utilisée pour l'API"
  value       = var.api_image
}

output "react_image" {
  description = "Image utilisée pour le frontend"
  value       = var.react_image
}
