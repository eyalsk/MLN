# Backend module configuration

variable "subnets" {
  description = "List of subnet IDs for the backend ECS service."
  type        = list(string)
}

variable "security_group_id" {
  description = "ID of the security group for the backend ECS service."
  type        = string
}

resource "aws_ecs_cluster" "mln_cluster" {
  name = "mln-cluster"
}

resource "aws_ecs_task_definition" "dotnet_backend_task" {
  depends_on = [aws_db_instance.mssql_instance]

  family                   = "dotnet-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name      = "dotnet-backend"
      image     = "localhost:4566/dotnet-backend:latest"
      cpu       = 512
      memory    = 1024
      portMappings = [
        {
          containerPort = 5000
          hostPort      = 5000
        }
      ]
      environment = [
        {
          name  = "ASPNETCORE_ENVIRONMENT"
          value = "Production"
        },
        {
          name  = "DB_ADDRESS"
          value = aws_db_instance.mssql_instance.endpoint
        },
        {
          name  = "DB_NAME"
          value = aws_db_instance.mssql_instance.db_name
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "dotnet_backend_service" {
  name            = "dotnet-backend-service"
  cluster         = aws_ecs_cluster.mln_cluster.id
  task_definition = aws_ecs_task_definition.dotnet_backend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnets
    security_groups = [var.security_group_id]
  }
}

resource "aws_ecs_task_definition" "node_backend_task" {
  depends_on = [null_resource.opensearch_mapping]

  family                   = "node-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole" # Replace with your IAM role ARN
  container_definitions    = jsonencode([
    {
      name      = "node-backend"
      image     = "localhost:4566/node-backend:latest"
      cpu       = 256
      memory    = 512
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "OPENSEARCH_ENDPOINT_PROD"
          value = aws_opensearch_domain.mln_opensearch.endpoint
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "node_backend_service" {
  name            = "node-backend-service"
  cluster         = aws_ecs_cluster.mln_cluster.id
  task_definition = aws_ecs_task_definition.node_backend_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnets
    security_groups = [var.security_group_id]
  }
}

resource "aws_db_instance" "mssql_instance" {
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "sqlserver-ex"
  engine_version       = "15.00.4043.16.v1"
  instance_class       = "db.t3.micro"
  db_name              = "mln_database"
  parameter_group_name = "default.sqlserver-ex-15.0"
  publicly_accessible  = false
  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name = aws_db_subnet_group.mssql_subnet_group.name

  # Enable IAM authentication
  iam_database_authentication_enabled = true
}

resource "aws_db_subnet_group" "mssql_subnet_group" {
  name       = "mssql-subnet-group"
  subnet_ids = var.subnets
  description = "Subnet group for MSSQL RDS instance"
}

resource "null_resource" "opensearch_mapping" {
  provisioner "local-exec" {
    command = "echo 'Mapping OpenSearch indices'"
  }
}

resource "aws_opensearch_domain" "mln_opensearch" {
  domain_name = "mln-opensearch"

  cluster_config {
    instance_type = "t3.small.search"
    instance_count = 1
  }

  ebs_options {
    ebs_enabled = true
    volume_size = 10
    volume_type = "gp2"
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_ecs_task_definition" "nginx_task" {
  family                   = "nginx-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name      = "nginx"
      image     = "nginx:latest"
      cpu       = 256
      memory    = 512
      portMappings = [
        {
          containerPort = 80
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "nginx_service" {
  name            = "nginx-service"
  cluster         = aws_ecs_cluster.mln_cluster.id
  task_definition = aws_ecs_task_definition.nginx_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = var.subnets
    security_groups = [var.security_group_id]
  }
}

resource "aws_api_gateway_rest_api" "backend_api" {
  name = "backend-api"
}

resource "aws_api_gateway_resource" "categories_resource" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  parent_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  path_part   = "api/categories"
}

resource "aws_api_gateway_resource" "orders_resource" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
  parent_id   = aws_api_gateway_rest_api.backend_api.root_resource_id
  path_part   = "api/orders"
}

resource "aws_api_gateway_method" "categories_method" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.categories_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "orders_method" {
  rest_api_id   = aws_api_gateway_rest_api.backend_api.id
  resource_id   = aws_api_gateway_resource.orders_resource.id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "categories_integration" {
  rest_api_id             = aws_api_gateway_rest_api.backend_api.id
  resource_id             = aws_api_gateway_resource.categories_resource.id
  http_method             = aws_api_gateway_method.categories_method.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_ecs_service.dotnet_backend_service.name}.local"
}

resource "aws_api_gateway_integration" "orders_integration" {
  rest_api_id             = aws_api_gateway_rest_api.backend_api.id
  resource_id             = aws_api_gateway_resource.orders_resource.id
  http_method             = aws_api_gateway_method.orders_method.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${aws_ecs_service.node_backend_service.name}.local"
}

resource "aws_api_gateway_deployment" "backend_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.backend_api.id
}

output "dotnet_backend_service_name" {
  value = aws_ecs_service.dotnet_backend_service.name
}

output "node_backend_service_name" {
  value = aws_ecs_service.node_backend_service.name
}

output "nginx_service_name" {
  value = aws_ecs_service.nginx_service.name
}

resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/backend-logs"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_stream" "dotnet_backend_log_stream" {
  name           = "dotnet-backend-log-stream"
  log_group_name = aws_cloudwatch_log_group.backend_logs.name
}

resource "aws_cloudwatch_log_stream" "node_backend_log_stream" {
  name           = "node-backend-log-stream"
  log_group_name = aws_cloudwatch_log_group.backend_logs.name
}

resource "aws_cloudwatch_log_stream" "nginx_log_stream" {
  name           = "nginx-log-stream"
  log_group_name = aws_cloudwatch_log_group.backend_logs.name
}

resource "aws_iam_policy" "cloudwatch_logs_policy" {
  name        = "cloudwatch-logs-policy"
  description = "Policy to allow ECS tasks to write logs to CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"],
        Resource = "arn:aws:logs:*:*:log-group:/ecs/backend-logs:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_logs" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.cloudwatch_logs_policy.arn
}