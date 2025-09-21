const request = require("supertest");
const app = require("../src/app"); // Assuming app.js exports the Express app

jest.setTimeout(10000); // Set timeout to 10 seconds for all tests

jest.mock("@elastic/elasticsearch", () => {
  const mockClient = {
    count: jest.fn().mockResolvedValue({ body: { count: 0 } }),
    index: jest.fn().mockResolvedValue({}),
  };
  return { Client: jest.fn(() => mockClient) };
});

describe("Order API", () => {
  it("should return 201 for a valid order submission", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        user: {
          fullName: "John Doe",
          address: "123 Main St",
          email: "john.doe@example.com",
        },
        products: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      });

    expect(response.status).toBe(201); // Updated to match the correct status code
    expect(response.body.order).toHaveProperty("orderId"); // Updated to check nested property
  });

  it("should return 400 for an invalid order submission", async () => {
    const response = await request(app).post("/api/orders").send({}); // Sending an empty body

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
