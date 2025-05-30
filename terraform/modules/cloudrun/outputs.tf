output "service_url" {
  value       = google_cloud_run_v2_service.service.uri
  description = "The URL of the Cloud Run service"
}

output "service_name" {
  value       = google_cloud_run_v2_service.service.name
  description = "The name of the deployed service"
}

output "service_with_sql" {
  value       = google_cloud_run_v2_service.service_with_sql
  description = "The Cloud Run service with SQL connection"
}
