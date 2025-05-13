output "service_url" {
  value       = google_cloud_run_v2_service.chroma.uri
  description = "The URL of the ChromaDB service"
}