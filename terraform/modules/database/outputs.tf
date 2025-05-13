output "instance_connection_name" {
  value       = google_sql_database_instance.instance.connection_name
  description = "The connection name of the instance to be used in connection strings"
}

output "instance_ip_address" {
  value       = google_sql_database_instance.instance.public_ip_address
  description = "The public IP address of the database instance"
}

output "instance_name" {
  value       = google_sql_database_instance.instance.name
  description = "The name of the database instance"
}