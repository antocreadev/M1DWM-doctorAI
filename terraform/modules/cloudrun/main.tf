resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = var.image_name

      dynamic "env" {
        for_each = var.environment_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }
    }

    service_account = var.service_account

    scaling {
      max_instance_count = var.max_instances
    }

    timeout = "${var.timeout_seconds}s"
  }


  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Connexion à Cloud SQL via annotation au lieu de ressource séparée
resource "google_cloud_run_v2_service" "service_with_sql" {
  count    = var.db_instance != "" ? 1 : 0
  name     = "${var.service_name}-with-sql"
  location = var.region

  template {
    containers {
      image = var.image_name

      dynamic "env" {
        for_each = var.environment_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }
    }

    service_account = var.service_account

    scaling {
      max_instance_count = var.max_instances
    }

    timeout = "${var.timeout_seconds}s"

    annotations = {
      "run.googleapis.com/cloudsql-instances" = var.db_instance
    }
  }


  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# IAM pour l'accès public si allow_public est true
resource "google_cloud_run_service_iam_member" "public_access" {
  count = var.allow_public ? 1 : 0

  location = var.region
  service  = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
