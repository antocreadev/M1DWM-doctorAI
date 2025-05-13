# Outputs for deployed services

output "database_instance" {
  value       = module.database.instance_connection_name
  description = "Cloud SQL instance connection name"
}

output "backend_url" {
  description = "URL du backend avec connexion SQL"
  value       = length(module.backend.service_with_sql) > 0 ? module.backend.service_with_sql[0].uri : module.backend.service_url
}

output "frontend_url" {
  description = "URL du frontend"
  value       = module.frontend.service_url
}

output "chroma_url" {
  description = "URL du service ChromaDB"
  value       = module.chroma.service_url
}

output "ollama_url" {
  description = "URL du service Ollama"
  value       = module.ollama.service_url
}
