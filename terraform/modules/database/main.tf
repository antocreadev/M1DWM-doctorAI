resource "google_sql_database_instance" "instance" {
  name             = "mediassist-db"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"
    
    backup_configuration {
      enabled            = true
      binary_log_enabled = false
      start_time         = "03:00"
    }
    
    ip_configuration {
      ipv4_enabled = true
      require_ssl  = true
    }
  }
  
  deletion_protection = true
}

resource "google_sql_database" "database" {
  name     = var.db_name
  instance = google_sql_database_instance.instance.name
}

resource "google_sql_user" "user" {
  name     = var.db_user
  instance = google_sql_database_instance.instance.name
  password = var.db_password
}