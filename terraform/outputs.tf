output "s3_bucket_name" {
  description = "S3バケット名"
  value       = module.ryutabi_gallery.s3_bucket_name
}

output "website_endpoint" {
  description = "S3静的ウェブサイトのURL（QRコード用）"
  value       = "http://${module.ryutabi_gallery.website_endpoint}"
}
