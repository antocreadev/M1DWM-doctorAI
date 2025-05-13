locals {
  secret_names = [
    "DB_PASSWORD",
    "DB_USER",
    "DB_NAME",
    "DB_HOST",
    "JWT_SECRET"
  ]
}

resource "google_secret_manager_secret_iam_member" "cloudrun_secret_access" {
  for_each = toset(local.secret_names)

  project   = var.project_id
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_service_account.email}"
}
