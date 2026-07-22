resource "aws_s3_bucket" "gallery" {
  bucket = "${var.project_name}-${var.environment}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "gallery" {
  bucket = aws_s3_bucket.gallery.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "gallery" {
  bucket = aws_s3_bucket.gallery.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}
