variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト名（リソース名のプレフィックスに使用）"
  type        = string
  default     = "ryutabi-gallery"
}

variable "environment" {
  description = "環境名"
  type        = string
  default     = "prod"
}
