data "aws_iam_policy_document" "gallery_bucket" {
  statement {
    sid    = "PublicReadAccess"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.gallery.arn}/*"]
  }
}

resource "aws_s3_bucket_policy" "gallery" {
  bucket     = aws_s3_bucket.gallery.id
  policy     = data.aws_iam_policy_document.gallery_bucket.json
  depends_on = [aws_s3_bucket_public_access_block.gallery]
}
