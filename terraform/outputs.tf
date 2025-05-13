output "backend_url" {
  value       = module.backend.service_url
  description = "The URL of the backend service"
}

output "frontend_url" {
  value       = module.frontend.service_url
  description = "The URL of the frontend service"
}

output "ollama_url" {
  value       = module.ollama.service_url
  description = "The URL of the Ollama service"
}

output "chroma_url" {
  value       = module.chroma.service_url
  description = "The URL of the ChromaDB service"
}

output "database_instance" {
  value       = module.database.instance_name
  description = "The name of the database instance"
}