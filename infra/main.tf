terraform {
  required_version = "~> 1.1"

  backend "s3" {
    bucket = "dairyisscary-terraform-state"
    key    = "solid-a11y/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.2"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "solid_a11y_docs" {
  source = "../packages/solid-a11y-docs/infra"
}

output "documentation_static_bucket_name" {
  value = module.solid_a11y_docs.documentation_static_bucket_name
}
