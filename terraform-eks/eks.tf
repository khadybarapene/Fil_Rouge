# eks.tf
# On utilise le module officiel EKS de Terraform
# qui crée le cluster + les IAM roles + le node group

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.29"

  # Accès public à l'API server (pour kubectl depuis notre machine)
  cluster_endpoint_public_access = true

  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id

  # Node group : les machines qui font tourner les pods
  eks_managed_node_groups = {
    portfolio_nodes = {
      instance_types = [var.eks_node_instance_type]
      min_size       = var.eks_node_min
      max_size       = var.eks_node_max
      desired_size   = var.eks_node_desired

      labels = {
        Project = var.project_name
      }
    }
  }

  tags = {
    Project = var.project_name
  }
}
