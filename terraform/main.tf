# Activer les APIs nécessaires
resource "google_project_service" "services" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "compute.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key
  
  disable_dependent_services = true
  disable_on_destroy         = false
}

# Attendre que les APIs soient activées
resource "time_sleep" "api_activation" {
  depends_on      = [google_project_service.services]
  create_duration = "60s"
}

# Créer un dépôt Artifact Registry
resource "google_artifact_registry_repository" "repository" {
  depends_on = [time_sleep.api_activation]
  
  location      = var.region
  repository_id = "mediassist-images"
  description   = "Docker repository for MediAssist images"
  format        = "DOCKER"
}

# Créer les secrets dans Secret Manager
resource "google_secret_manager_secret" "db_password" {
  depends_on = [time_sleep.api_activation]
  
  secret_id = "DB_PASSWORD"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password_version" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt_secret" {
  depends_on = [time_sleep.api_activation]
  
  secret_id = "JWT_SECRET"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret_version" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

# Créer les autres secrets (DB_USER, DB_NAME, DB_HOST)
resource "google_secret_manager_secret" "db_user" {
  depends_on = [time_sleep.api_activation]
  
  secret_id = "DB_USER"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_user_version" {
  secret      = google_secret_manager_secret.db_user.id
  secret_data = var.db_user
}

resource "google_secret_manager_secret" "db_name" {
  depends_on = [time_sleep.api_activation]
  
  secret_id = "DB_NAME"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_name_version" {
  secret      = google_secret_manager_secret.db_name.id
  secret_data = var.db_name
}

# Module pour la base de données PostgreSQL
module "database" {
  source     = "./modules/database"
  depends_on = [time_sleep.api_activation]
  
  project_id  = var.project_id
  region      = var.region
  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password
  db_tier     = var.db_tier
}

# Ajouter le secret DB_HOST après avoir créé la base de données
resource "google_secret_manager_secret" "db_host" {
  depends_on = [module.database]
  
  secret_id = "DB_HOST"
  
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_host_version" {
  secret      = google_secret_manager_secret.db_host.id
  secret_data = module.database.instance_connection_name
}

# Compte de service pour les services Cloud Run
resource "google_service_account" "cloudrun_service_account" {
  account_id   = "cloudrun-service-account"
  display_name = "Cloud Run Service Account"
}

# Donner au compte de service l'accès au Secret Manager
resource "google_secret_manager_secret_iam_member" "cloudrun_secret_access" {
  for_each = toset([
    google_secret_manager_secret.db_password.id,
    google_secret_manager_secret.db_user.id,
    google_secret_manager_secret.db_name.id,
    google_secret_manager_secret.db_host.id,
    google_secret_manager_secret.jwt_secret.id
  ])
  
  secret_id = each.key
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}

# Module pour le backend Flask (Cloud Run)
module "backend" {
  source     = "./modules/cloudrun"
  depends_on = [
    module.database, 
    google_secret_manager_secret_version.db_host_version,
    google_secret_manager_secret_iam_member.cloudrun_secret_access
  ]
  
  project_id        = var.project_id
  region            = var.region
  service_name      = "mediassist-backend"
  image_name        = "${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/backend:latest"
  service_account   = google_service_account.cloudrun_service_account.email
  db_instance       = module.database.instance_connection_name
  
  environment_vars = {
    "ENVIRONMENT"         = "production"
    "GOOGLE_CLOUD_PROJECT" = var.project_id
  }
  
  allow_public     = false
  concurrency      = 80
  cpu              = 1
  memory           = "512Mi"
  timeout_seconds  = 300
  max_instances    = 10
}

# Module pour le frontend Next.js (Cloud Run)
module "frontend" {
  source     = "./modules/cloudrun"
  depends_on = [module.backend]
  
  project_id        = var.project_id
  region            = var.region
  service_name      = "mediassist-frontend"
  image_name        = "${var.region}-docker.pkg.dev/${var.project_id}/mediassist-images/frontend:latest"
  service_account   = google_service_account.cloudrun_service_account.email
  
  environment_vars = {
    "NODE_ENV"           = "production"
    "NEXT_PUBLIC_API_URL" = module.backend.service_url
  }
  
  allow_public     = true
  concurrency      = 80
  cpu              = 1
  memory           = "512Mi"
  timeout_seconds  = 300
  max_instances    = 10
}

# Module pour Ollama (Cloud Run avec GPU)
module "ollama" {
  source     = "./modules/ollama"
  depends_on = [time_sleep.api_activation]
  
  project_id        = var.project_id
  region            = var.region
  service_account   = google_service_account.cloudrun_service_account.email
}

# Module pour ChromaDB (Cloud Run)
module "chroma" {
  source     = "./modules/chroma"
  depends_on = [time_sleep.api_activation]
  
  project_id        = var.project_id
  region            = var.region
  service_account   = google_service_account.cloudrun_service_account.email
}