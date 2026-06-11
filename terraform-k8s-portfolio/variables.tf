variable "api_image" {
  description = "Image Docker de l'API"
  default     = "khady2026/portfolio-api:latest"
}

variable "react_image" {
  description = "Image Docker du frontend React"
  default     = "khady2026/portfolio-react:latest"
}

variable "api_replicas" {
  description = "Nombre de replicas pour l'API"
  type        = number
  default     = 2
}

variable "react_replicas" {
  description = "Nombre de replicas pour le frontend"
  type        = number
  default     = 2
}

variable "ingress_host" {
  description = "Nom de domaine pour l'Ingress (ex: portfolio.local)"
  type        = string
  default     = "portfolio.local"
}
