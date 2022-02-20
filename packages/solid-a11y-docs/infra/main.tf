resource "aws_s3_bucket" "docs_website_bucket" {
  bucket = "solid-a11y"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_policy" "docs_website_bucket_policy" {
  bucket = aws_s3_bucket.docs_website_bucket.id
  policy = data.aws_iam_policy_document.docs_website_bucket_policy_document.json
}

data "aws_iam_policy_document" "docs_website_bucket_policy_document" {
  statement {
    sid       = "PublicReadAccess"
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${aws_s3_bucket.docs_website_bucket.bucket}/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_website_configuration" "docs_website_bucket_website" {
  bucket = aws_s3_bucket.docs_website_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_versioning" "docs_website_bucket_versioning" {
  bucket = aws_s3_bucket.docs_website_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "docs_website_bucket_lifecycle" {
  bucket = aws_s3_bucket.docs_website_bucket.id

  rule {
    id     = "DeleteOldVersions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 14
    }
  }
}

output "documentation_static_bucket_name" {
  value = aws_s3_bucket.docs_website_bucket.bucket
}
