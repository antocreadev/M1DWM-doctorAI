# Compte de service spécifique pour Ollama
resource "google_service_account" "ollama_service_account" {
  account_id   = "ollama-service-account"
  display_name = "Service Account for Ollama Cloud Run service"
}

# Service Cloud Run pour Ollama avec GPU
resource "google_cloud_run_v2_service" "ollama" {
  name     = "ollama-gemma"
  location = var.region
  
  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/ollama-gemma:latest"
      
      resources {
        limits = {
          cpu    = "8"
          memory = "32Gi"
        }
        
        accelerator {
          type  = "nvidia-l4"
          count = 1
        }
      }
      
      env {
        name  = "OLLAMA_NUM_PARALLEL"
        value = "4"
      }
    }
    
    service_account = google_service_account.ollama_service_account.email
    
    scaling {
      max_instance_count = 7
    }
    
    timeout = "600s"
    
    # Désactiver le CPU throttling pour permettre l'utilisation du GPU
    annotations = {
      "run.googleapis.com/cpu-throttling" = "false"
    }
  }
  
  client {
    max_concurrency = 4
  }
  
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Fichier Dockerfile pour Ollama
resource "local_file" "ollama_dockerfile" {
  content = <<-EOF
  FROM ollama/ollama:0.3.6

  # Écoute sur toutes les interfaces, port 8080
  ENV OLLAMA_HOST 0.0.0.0:8080

  # Stocke les fichiers de poids de modèle dans /models
  ENV OLLAMA_MODELS /models

  # Réduit la verbosité des logs
  ENV OLLAMA_DEBUG false

  # Ne jamais décharger les poids du modèle du GPU
  ENV OLLAMA_KEEP_ALIVE -1 

  # Stocke les poids du modèle dans l'image du conteneur
  ENV MODEL gemma2:9b
  RUN ollama serve & sleep 5 && ollama pull $MODEL 

  # Démarre Ollama
  ENTRYPOINT ["ollama", "serve"]
  EOF
  
  filename = "${path.module}/Dockerfile"
}

# Commande Cloud Build à exécuter manuellement après le déploiement de Terraform
resource "null_resource" "ollama_build_command" {
  provisioner "local-exec" {
    command = <<-EOT
      echo "Exécutez la commande suivante manuellement pour construire l'image Ollama:"
      echo "gcloud builds submit --tag ${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/ollama-gemma --machine-type e2-highcpu-32 ${path.module}"
    EOT
  }
  
  depends_on = [local_file.ollama_dockerfile]
}