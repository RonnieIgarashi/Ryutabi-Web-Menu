output "cloudfront_domain" {
  description = "CloudFrontのドメイン名（サイトURL）"
  value       = module.ryutabi_gallery.cloudfront_domain
}

output "s3_bucket_name" {
  description = "S3バケット名"
  value       = module.ryutabi_gallery.s3_bucket_name
}
