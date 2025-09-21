variable "s3_bucket_name" {
  description = "Name of the S3 bucket for the frontend"
  type        = string
  default     = "mln-website"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}