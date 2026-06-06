data "aws_iam_policy_document" "gallery_bucket" {
  statement {
    sid    = "AllowCloudFrontAccess"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.gallery.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.gallery.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "gallery" {
  bucket = aws_s3_bucket.gallery.id
  policy = data.aws_iam_policy_document.gallery_bucket.json
}
