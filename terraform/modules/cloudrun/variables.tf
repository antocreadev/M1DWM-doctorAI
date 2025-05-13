variable "project_id" {
  description = "The ID of the project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
}

variable "image_name" {
  description = "The name of the Docker image to deploy"
  type        = string
}

variable "service_account" {
  description = "The service account to use for the Cloud Run service"
  type        = string
}

variable "environment_vars" {
  description = "Environment variables to set on the Cloud Run service"
  type        = map(string)
  default     = {}
}

variable "allow_public" {
  description = "Whether to allow public access to the service"
  type        = bool
  default     = false
}

variable "concurrency" {
  description = "The maximum number of concurrent requests per container"
  type        = number
  default     = 80
}

variable "cpu" {
  description = "The amount of CPU to allocate to the service"
  type        = number
  default     = 1
}

variable "memory" {
  description = "The amount of memory to allocate to the service"
  type        = string
  default     = "512Mi"
}

variable "timeout_seconds" {
  description = "The maximum amount of time a request has to complete"
  type        = number
  default     = 300
}

variable "max_instances" {
  description = "The maximum number of instances to scale to"
  type        = number
  default     = 10
}

variable "db_instance" {
  description = "The connection name of the database instance"
  type        = string
  default     = ""
}