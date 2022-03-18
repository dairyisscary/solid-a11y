terraform {
  required_version = "~> 1.1"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.2"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.10"
    }
  }
}

locals {
  root_domain = "solid-a11y.dev"
}

resource "aws_s3_bucket" "docs_website_bucket" {
  bucket = "www.${local.root_domain}"
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

resource "cloudflare_zone" "root_zone" {
  zone = local.root_domain
}

resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "CNAME"
  name    = "@"
  value   = "www.${local.root_domain}"
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "CNAME"
  name    = "www"
  value   = aws_s3_bucket.docs_website_bucket.website_endpoint
  proxied = true
}

resource "cloudflare_record" "spf" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "TXT"
  name    = "@"
  value   = "v=spf1 -all"
}

resource "cloudflare_record" "dkim" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "TXT"
  name    = "*._domainkey"
  value   = "v=DKIM1; p="
}

resource "cloudflare_record" "dmarc" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "TXT"
  name    = "_dmarc"
  value   = "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"
}

resource "cloudflare_zone_settings_override" "root_zone" {
  zone_id = cloudflare_zone.root_zone.id

  settings {
    always_use_https         = "on"
    automatic_https_rewrites = "off"
    brotli                   = "on"
    browser_check            = "off"
    http3                    = "on"
    ipv6                     = "on"
    min_tls_version          = "1.2"
    security_level           = "essentially_off"
    ssl                      = "flexible"
    tls_1_3                  = "on"
    websockets               = "off"
  }
}
