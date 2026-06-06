resource "aws_s3_bucket" "gallery" {
  bucket = "${var.project_name}-${var.environment}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "gallery" {
  bucket = aws_s3_bucket.gallery.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
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
