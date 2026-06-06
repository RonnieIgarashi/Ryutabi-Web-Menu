output "cloudfront_domain" {
  value = aws_cloudfront_distribution.gallery.domain_name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.gallery.id
}
