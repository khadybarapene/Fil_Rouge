# outputs.tf

output "vpc_id" {
  description = "ID du VPC créé"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "ID du subnet public"
  value       = aws_subnet.public.id
}

output "ec2_public_ip" {
  description = "IP publique de l'EC2 — accès à l'app"
  value       = aws_instance.portfolio.public_ip
}

output "ec2_public_dns" {
  description = "DNS public de l'EC2"
  value       = aws_instance.portfolio.public_dns
}

output "app_url" {
  description = "URL de l'application React"
  value       = "http://${aws_instance.portfolio.public_ip}:3000"
}

output "api_url" {
  description = "URL de l'API Node"
  value       = "http://${aws_instance.portfolio.public_ip}:5000"
}