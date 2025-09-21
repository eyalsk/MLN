# Use the official .NET SDK image as the base image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS base

# Set the working directory in the container
WORKDIR /app

# Copy only the project file to leverage Docker layer caching
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the application code
COPY . ./

# Use the base image in the main Dockerfile
FROM base AS build

# Build the application with trimming
RUN dotnet publish -c Release -o /out --no-restore --self-contained -p:PublishTrimmed=true

# Use the official .NET runtime Alpine image as the base image for running the application
FROM mcr.microsoft.com/dotnet/runtime:8.0-alpine AS runtime

# Set the working directory in the container
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /out ./

# Expose the application port
EXPOSE 5000

# Start the application
ENTRYPOINT ["dotnet", "dotnet-backend.dll"]