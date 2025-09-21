provider "aws" {
  profile = "localstack"
  region  = "us-east-1"

  endpoints {
    s3         = "http://localhost:4566"
    ecs        = "http://localhost:4566"
    rds        = "http://localhost:4566"
    opensearch = "http://localhost:4566"
  }
}

module "backend" {
  source = "./modules/backend"
  subnets = [
    module.shared.mln_subnet_1_id,
    module.shared.mln_subnet_2_id
  ]
  security_group_id = module.shared.mln_lb_sg_id
}

module "frontend" {
  source = "./modules/frontend"

  backend_endpoint = "http://${module.backend.nginx_service_name}.local"
  s3_bucket_name   = "mln-website" # Replace with your bucket name
}

module "shared" {
  source = "./modules/shared"
}