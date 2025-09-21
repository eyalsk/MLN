resource "aws_vpc" "mln_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
}

resource "aws_security_group" "mln_lb_sg" {
  name        = "mln-lb-sg"
  description = "Security group for the Load Balancer"
  vpc_id      = aws_vpc.mln_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_subnet" "mln_subnet_1" {
  vpc_id                  = aws_vpc.mln_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "mln_subnet_2" {
  vpc_id                  = aws_vpc.mln_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
}

output "mln_subnet_1_id" {
  value = aws_subnet.mln_subnet_1.id
}

output "mln_subnet_2_id" {
  value = aws_subnet.mln_subnet_2.id
}

output "mln_lb_sg_id" {
  value = aws_security_group.mln_lb_sg.id
}