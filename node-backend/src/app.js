require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const order_routes = require("./routes/order");
const { swagger_ui, swagger_spec } = require("./swagger");
const expressOasGenerator = require("express-oas-generator");

app.use(express.json());
app.use(cors()); // Enable CORS for all origins

// Initialize OpenAPI documentation generator
expressOasGenerator.init(app, {});

app.use("/api/orders", order_routes);

// Serve dynamically generated Swagger documentation at /swagger
app.use("/swagger/v1/swagger.json", (req, res) => {
  res.json(require("express-oas-generator").getSpec());
});

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Send a generic error response
  res.status(err.status || 500).json({
    error: "An unexpected error occurred",
    message: err.message,
  });
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(port);
}

module.exports = app;
