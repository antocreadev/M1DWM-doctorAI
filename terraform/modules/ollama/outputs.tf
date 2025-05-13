output "service_url" {
  value       = google_cloud_run_v2_service.ollama.uri
  description = "The URL of the Ollama service"
}

output "service_account_email" {
  value       = google_service_account.ollama_service_account.email
  description = "The email of the service account for Ollama"
}