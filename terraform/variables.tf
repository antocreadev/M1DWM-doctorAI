variable "project_id" {
  description = "The ID of the project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "The zone to deploy resources"
  type        = string
  default     = "europe-west1-b"
}

variable "db_tier" {
  description = "The tier of the database instance"
  type        = string
  default     = "db-g1-small"
}

variable "db_name" {
  description = "The name of the database"
  type        = string
  default     = "mediassist"
}

variable "db_user" {
  description = "The username for the database"
  type        = string
  default     = "mediassist-app"
}

variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret for JWT token generation"
  type        = string
  sensitive   = true
}