resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.region
  
  template {
    containers {
      image = var.image_name
      
      env {
        name  = "PORT"
        value = "8080"
      }
      
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
    
    dynamic "vpc_access" {
      for_each = var.db_instance != "" ? [1] : []
      content {
        connector = null
        egress    = "ALL_TRAFFIC"
      }
    }
  }
  
  client {
    max_concurrency = var.concurrency
  }
  
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Configuration de l'accès à Cloud SQL si nécessaire
resource "google_cloud_run_v2_service_sql_connection" "sql_connection" {
  count = var.db_instance != "" ? 1 : 0
  
  service     = google_cloud_run_v2_service.service.name
  location    = var.region
  instance    = var.db_instance
  enabled     = true
}

# IAM pour l'accès public si allow_public est true
resource "google_cloud_run_service_iam_member" "public_access" {
  count = var.allow_public ? 1 : 0
  
  location = var.region
  service  = google_cloud_run_v2_service.service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}