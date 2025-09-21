# Enable error handling
$ErrorActionPreference = "Stop"

try {
    # Set variables
    $projectRoot = (Get-Location).Path
    $dockerRegistry = "localhost:5000"  # Use local Docker registry
    $terraformDir = "$projectRoot\terraform"
    $nodeBackendDir = "$projectRoot\node-backend"
    $dotnetBackendDir = "$projectRoot\dotnet-backend"
    $clientDir = "$projectRoot\client"
    $s3BucketName = "MLN_SITE" # <-- Add your S3 bucket name here

    # Step 1: Build and Tag Docker Images
    Write-Host "Building and tagging Docker images..."

    # Node.js Backend
    Write-Host "Building Node.js backend..."
    docker build -t $dockerRegistry/node-backend:latest $nodeBackendDir
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build Node.js backend Docker image."
    }

    # .NET Backend
    Write-Host "Building .NET backend..."
    docker build -t $dockerRegistry/dotnet-backend:latest $dotnetBackendDir
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build .NET backend Docker image."
    }

    # Build React Frontend
    Write-Host "Building React frontend..."
    Set-Location $clientDir
    npm install
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build React frontend."
    }

    # Step 2: Push Docker Images to Registry
    Write-Host "Pushing Docker images to registry..."

    docker push $dockerRegistry/node-backend:latest
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push Node.js backend Docker image."
    }

    docker push $dockerRegistry/dotnet-backend:latest
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push .NET backend Docker image."
    }

    # Step 3: Initialize and Apply Terraform
    Write-Host "Initializing and applying Terraform..."

    # Navigate to the Terraform directory
    Set-Location $terraformDir

    # Initialize Terraform
    terraform init
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize Terraform."
    }

    # Plan and Apply Terraform
    terraform plan -out=tfplan
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to plan Terraform."
    }

    terraform apply -auto-approve tfplan
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to apply Terraform."
    }

    # Step 4: Ensure S3 Bucket Exists
    Write-Host "Ensuring S3 bucket exists in LocalStack..."
    aws s3 mb s3://$s3BucketName --endpoint-url=http://localhost:4566
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create S3 bucket."
    }

    # Upload React Frontend to S3
    Write-Host "Uploading React frontend to S3..."
    aws s3 sync $clientDir/dist s3://$s3BucketName --endpoint-url=http://localhost:4566 --delete
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to upload React frontend to S3."
    }

    # Step 5: Verify Deployment
    Write-Host "Verifying deployment..."
    terraform output
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to verify deployment."
    }

    Write-Host "Deployment completed successfully!"
} catch {
    Write-Error "An error occurred: $_"
    exit 1
}