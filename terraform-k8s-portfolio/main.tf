# ──────────────────────────────────────────
# NAMESPACE
# ──────────────────────────────────────────
resource "kubernetes_namespace" "portfolio" {
  metadata {
    name = "portfolio"
    labels = {
      app = "portfolio"
    }
  }
}

# ──────────────────────────────────────────
# SECRET — MongoDB URI
# ──────────────────────────────────────────
resource "kubernetes_secret" "mongo_secret" {
  metadata {
    name      = "mongo-secret"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  data = {
    uri = "mongodb://mongo-service:27017/portfolioDB"
  }
}

# ──────────────────────────────────────────
# CONFIGMAP
# ──────────────────────────────────────────
resource "kubernetes_config_map" "portfolio_config" {
  metadata {
    name      = "portfolio-config"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  data = {
    NODE_ENV = "production"
    PORT     = "5000"
  }
}

# ──────────────────────────────────────────
# MONGODB — StatefulSet
# ──────────────────────────────────────────
resource "kubernetes_stateful_set" "mongo" {
  metadata {
    name      = "mongo"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    service_name = "mongo-service"
    replicas     = 1

    selector {
      match_labels = { app = "mongo" }
    }

    template {
      metadata {
        labels = { app = "mongo" }
      }

      spec {
        container {
          name  = "mongo"
          image = "mongo:7"

          port {
            container_port = 27017
          }

          volume_mount {
            name       = "mongo-data"
            mount_path = "/data/db"
          }
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "mongo-data"
      }
      spec {
        access_modes = ["ReadWriteOnce"]
        resources {
          requests = { storage = "1Gi" }
        }
      }
    }
  }
}

# ──────────────────────────────────────────
# MONGODB — Service (Headless)
# ──────────────────────────────────────────
resource "kubernetes_service" "mongo" {
  metadata {
    name      = "mongo-service"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector   = { app = "mongo" }
    cluster_ip = "None"
    port {
      port        = 27017
      target_port = 27017
    }
  }
}

# ──────────────────────────────────────────
# API — Deployment
# ──────────────────────────────────────────
resource "kubernetes_deployment" "api" {
  metadata {
    name      = "portfolio-api"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    replicas = var.api_replicas

    selector {
      match_labels = { app = "portfolio-api" }
    }

    template {
      metadata {
        labels = { app = "portfolio-api" }
      }

      spec {
        container {
          name              = "api"
          image             = var.api_image
          image_pull_policy = "Always"

          port {
            container_port = 5000
          }

          env {
            name = "MONGO_URI"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.mongo_secret.metadata[0].name
                key  = "uri"
              }
            }
          }

          env {
            name = "NODE_ENV"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.portfolio_config.metadata[0].name
                key  = "NODE_ENV"
              }
            }
          }

          env {
            name = "PORT"
            value_from {
              config_map_key_ref {
                name = kubernetes_config_map.portfolio_config.metadata[0].name
                key  = "PORT"
              }
            }
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/api/projects"
              port = 5000
            }
            initial_delay_seconds = 15
            period_seconds        = 20
          }

          readiness_probe {
            http_get {
              path = "/api/projects"
              port = 5000
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# ──────────────────────────────────────────
# API — Service
# ──────────────────────────────────────────
resource "kubernetes_service" "api" {
  metadata {
    name      = "api-service"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = { app = "portfolio-api" }
    type     = "ClusterIP"
    port {
      port        = 80
      target_port = 5000
    }
  }
}

# ──────────────────────────────────────────
# REACT — Deployment
# ──────────────────────────────────────────
resource "kubernetes_deployment" "react" {
  metadata {
    name      = "portfolio-react"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    replicas = var.react_replicas

    selector {
      match_labels = { app = "portfolio-react" }
    }

    template {
      metadata {
        labels = { app = "portfolio-react" }
      }

      spec {
        container {
          name              = "react"
          image             = var.react_image
          image_pull_policy = "Always"

          port {
            container_port = 80
          }

          resources {
            requests = {
              cpu    = "50m"
              memory = "64Mi"
            }
            limits = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 10
            period_seconds        = 20
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# ──────────────────────────────────────────
# REACT — Service
# ──────────────────────────────────────────
resource "kubernetes_service" "react" {
  metadata {
    name      = "react-service"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
  }

  spec {
    selector = { app = "portfolio-react" }
    type     = "ClusterIP"
    port {
      port        = 80
      target_port = 80
    }
  }
}

# ──────────────────────────────────────────
# INGRESS — NGINX
# ──────────────────────────────────────────
resource "kubernetes_ingress_v1" "portfolio" {
  metadata {
    name      = "portfolio-ingress"
    namespace = kubernetes_namespace.portfolio.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                = "nginx"
      "nginx.ingress.kubernetes.io/rewrite-target" = "/$2"
    }
  }

  spec {
    rule {
      host = var.ingress_host
      http {
        # Frontend — /
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.react.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }

        # API — /api
        path {
          path      = "/api(/|$)(.*)"
          path_type = "ImplementationSpecific"
          backend {
            service {
              name = kubernetes_service.api.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}
