resource "local_file" "react_config" {
  content = jsonencode({
    backend_endpoint = local.backend_endpoint
  })
  filename = "${path.module}/config.json"
}

resource "aws_s3_object" "react_config" {
  bucket = aws_s3_bucket.frontend_bucket.id
  key    = "config.json"
  source = local_file.react_config.filename
  acl    = "public-read"
  content_type = "application/json"
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket_prefix = "mln-frontend-"
}

resource "aws_s3_bucket_website_configuration" "frontend_bucket_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_acl" "frontend_bucket_acl" {
  bucket = aws_s3_bucket.frontend_bucket.id
  acl    = "public-read"
}

locals {
  backend_endpoint = var.backend_endpoint
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for the frontend."
  type        = string
}

variable "backend_endpoint" {
  description = "The backend endpoint for the React app."
  type        = string
}