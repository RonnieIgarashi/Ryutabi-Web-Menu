output "s3_bucket_name" {
  value = aws_s3_bucket.gallery.id
}

output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.gallery.website_endpoint
}
