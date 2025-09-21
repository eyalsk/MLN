const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const axios = require("axios");

const app = express();

let dotnet_endpoints = [];
let node_endpoints = []; // Now an empty array to be populated by Swagger specs

// Fetch Swagger specifications and parse endpoints
const fetch_swagger_specs = async () => {
  try {
    const dotnet_spec = await axios.get(
      "http://localhost:5000/swagger/v1/swagger.json"
    );
    const node_spec = await axios.get(
      "http://localhost:3000/swagger/v1/swagger.json"
    );

    dotnet_endpoints = Object.keys(dotnet_spec.data.paths);
    node_endpoints = Object.keys(node_spec.data.paths);
  } catch (error) {
    console.error("Error fetching Swagger specifications:", error.message);
    if (error.config) {
      console.error("Failed URL:", error.config.url);
    }
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
  }
};

// Middleware to dynamically proxy requests
app.use("/", (req, res, next) => {
  const endpoint = req.path;

  // Check for exact matches
  if (dotnet_endpoints.includes(endpoint)) {
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
    })(req, res, next);
  }
  // Check for dynamic path parameters
  else if (
    dotnet_endpoints.some((e) =>
      new RegExp(`^${e.replace(/{[^}]+}/g, "[^/]+")}$`).test(endpoint)
    )
  ) {
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
    })(req, res, next);
  } else if (node_endpoints.includes(endpoint)) {
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })(req, res, next);
  }
  // Check for dynamic path parameters in Node.js endpoints
  else if (
    node_endpoints.some((e) =>
      new RegExp(`^${e.replace(/{[^}]+}/g, "[^/]+")}$`).test(endpoint)
    )
  ) {
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })(req, res, next);
  } else {
    res.status(404).send("Endpoint not found in any backend");
  }

  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];

  res.write = function (chunk, ...args) {
    chunks.push(chunk);
    originalWrite.call(res, chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString("utf8");
    originalEnd.call(res, chunk, ...args);
  };

  res.on("finish", () => {});
});

// Start the proxy server
app.listen(8080, async () => {
  console.log("Proxy server running on http://localhost:8080");
  console.log(
    "Dotnet Swagger URL: http://localhost:5000/swagger/v1/swagger.json"
  );
  console.log(
    "Node Swagger URL: http://localhost:3000/swagger/v1/swagger.json"
  );
  await fetch_swagger_specs(); // Fetch Swagger specs on startup
});
