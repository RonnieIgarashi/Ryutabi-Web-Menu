terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # TODO: S3 backend を設定する（P03の知見流用）
  # backend "s3" {
  #   bucket = "your-tfstate-bucket"
  #   key    = "ryutabi-gallery/terraform.tfstate"
  #   region = "ap-northeast-1"
  # }
}

provider "aws" {
  region = var.aws_region
}

module "ryutabi_gallery" {
  source = "./modules/ryutabi-gallery"

  project_name = var.project_name
  environment  = var.environment
}
