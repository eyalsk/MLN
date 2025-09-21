const swagger_ui = require("swagger-ui-express");
const swagger_jsdoc = require("swagger-jsdoc");
const path = require("path");

const swagger_options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API",
      version: "1.0.0",
    },
  },
  apis: [path.join(__dirname, "routes", "*.js")], // Automatically discover all route files
};

const swagger_spec = swagger_jsdoc(swagger_options);

module.exports = { swagger_ui, swagger_spec };
