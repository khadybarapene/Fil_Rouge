# variables.tf

variable "kubeconfig_path" {
  description = "Chemin vers le fichier kubeconfig"
  type        = string
  default     = "~/.kube/config"
}

variable "api_image" {
  description = "Image Docker de l'API"
  type        = string
  default     = "khady2026/portfolio-api:latest"
}

variable "react_image" {
  description = "Image Docker du React"
  type        = string
  default     = "khady2026/portfolio-react:latest"
} 