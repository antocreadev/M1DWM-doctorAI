# Service Cloud Run pour ChromaDB
resource "google_cloud_run_v2_service" "chroma" {
  name     = "chromadb"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/chromadb:latest"

      # Expose le port 8000 utilisé par ChromaDB
      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "4Gi"
        }
      }
    }

    service_account = var.service_account

    scaling {
      max_instance_count = 2
    }

    timeout = "300s"
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Fichier Dockerfile pour ChromaDB
resource "local_file" "chromadb_dockerfile" {
  content = <<-EOF
    FROM chromadb/chroma:latest

    # Configuration pour persister les données
    ENV CHROMA_DB_IMPL=duckdb
    ENV CHROMA_PERSISTENCE_DIRECTORY=/chroma/data

    # Exposer le port par défaut
    EXPOSE 8000

    # Commande par défaut
    CMD ["uvicorn", "chromadb.app:app", "--host", "0.0.0.0", "--port", "8000"]
  EOF

  filename = "${path.module}/Dockerfile"
}

# Commande Cloud Build à exécuter manuellement après le déploiement de Terraform
resource "null_resource" "chromadb_build_command" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Exécutez la commande suivante manuellement pour construire l'image ChromaDB:"
      echo "gcloud builds submit --tag ${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/chromadb:latest --machine-type e2-highcpu-8 \${path.module}"
    EOT
  }

  depends_on = [local_file.chromadb_dockerfile]
}
