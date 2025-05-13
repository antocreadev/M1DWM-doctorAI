locals {
  backend_url = length(module.backend.service_with_sql) > 0 ? module.backend.service_with_sql[0].uri : module.backend.service_url
}
