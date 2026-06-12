# variables.tf

variable "aws_region" {
  description = "La région AWS où déployer"
  type        = string
  default     = "eu-west-3"  # Paris
}

variable "project_name" {
  description = "Nom du projet (utilisé pour nommer les ressources)"
  type        = string
  default     = "portfolio"
}

variable "vpc_cidr" {
  description = "Le bloc CIDR du VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "Le bloc CIDR du subnet public"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "Le type d'instance EC2"
  type        = string
  default     = "t3.micro"  # Free tier
}

variable "ami_id" {
  description = "L'AMI à utiliser pour l'EC2 (Ubuntu 22.04)"
  type        = string
  default     = "ami-0160e8d70ebc43ee1"  # Ubuntu 22.04 eu-west-3
}