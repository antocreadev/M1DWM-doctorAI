variable "project_id" {
  description = "The ID of the project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
}

variable "service_account" {
  description = "The service account to use for the Cloud Run service"
  type        = string
}