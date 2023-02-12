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
  old_root_domain = "solid-a11y.dev"
  root_domain     = "spookysoftware.dev"
  docs_subdomain  = "solid-a11y"
}

resource "aws_s3_bucket" "docs_website_bucket" {
  bucket = "${local.docs_subdomain}.${local.root_domain}"
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
  zone = local.old_root_domain
}

data "cloudflare_zone" "root_zone" {
  name = local.root_domain
}

resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "CNAME"
  name    = "@"
  value   = "${local.docs_subdomain}.${local.root_domain}"
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.root_zone.id
  type    = "CNAME"
  name    = "www"
  value   = "${local.docs_subdomain}.${local.root_domain}"
  proxied = true
}

resource "cloudflare_record" "a11y_subdomain" {
  zone_id = data.cloudflare_zone.root_zone.id
  type    = "CNAME"
  name    = local.docs_subdomain
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
    browser_cache_ttl        = 0
    browser_check            = "off"
    http3                    = "on"
    ipv6                     = "on"
    min_tls_version          = "1.2"
    security_level           = "essentially_off"
    ssl                      = "flexible"
    tls_1_3                  = "zrt"
    websockets               = "off"
    zero_rtt                 = "on"
  }
}

resource "cloudflare_ruleset" "transform_http_headers" {
  zone_id     = cloudflare_zone.root_zone.id
  name        = "Add Security HTTP Headers"
  description = "Add security headers to responses"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rules {
    enabled     = true
    description = "Add security headers to all HTML content-type responses"
    action      = "rewrite"
    expression  = "any(http.response.headers[\"content-type\"][*] contains \"text/html\")"

    action_parameters {
      # Keep these alphabetized by name so that terraform doesn't diff
      headers {
        operation = "set"
        name      = "Referrer-Policy"
        value     = "no-referrer-when-downgrade"
      }

      headers {
        operation = "set"
        name      = "X-Content-Type-Options"
        value     = "nosniff"
      }

      headers {
        operation = "set"
        name      = "X-Frame-Options"
        value     = "DENY"
      }

      headers {
        operation = "set"
        name      = "X-XSS-Protection"
        value     = "1; mode=block"
      }
    }
  }
}

resource "cloudflare_page_rule" "redirect_root_to_www" {
  zone_id = cloudflare_zone.root_zone.id
  target  = "${local.old_root_domain}/*"

  actions {
    forwarding_url {
      url         = "https://${local.docs_subdomain}.${local.root_domain}/$1"
      status_code = 301
    }
  }
}

resource "cloudflare_page_rule" "redirect_www_root_to_new" {
  zone_id = cloudflare_zone.root_zone.id
  target  = "www.${local.old_root_domain}/*"

  actions {
    forwarding_url {
      url         = "https://${local.docs_subdomain}.${local.root_domain}/$1"
      status_code = 301
    }
  }
}
