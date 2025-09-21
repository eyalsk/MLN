const express = require("express");
const router = express.Router();
const { Client, errors } = require("@elastic/elasticsearch");

const esClient = new Client({
  node:
    process.env.NODE_ENV === "production"
      ? process.env.OPENSEARCH_ENDPOINT_PROD
      : process.env.OPENSEARCH_ENDPOINT_DEV || "http://localhost:9200",
});

class Mutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }

  lock() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.locked = false;
    }
  }
}

const mutex = new Mutex();

const generateUniqueOrderId = async () => {
  await mutex.lock();
  try {
    const response = await esClient.count({
      index: "orders",
    });
    const count = response.count;
    const orderId = count + 1;
    return orderId;
  } catch (error) {
    console.error("Error in Elasticsearch count API:", error.message);
    console.error("Falling back to timestamp-based order ID");
    return Date.now();
  } finally {
    mutex.unlock();
  }
};

router.post("/", async (req, res) => {
  try {
    const { user, products } = req.body;

    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const order_id = await generateUniqueOrderId();

    const order = { order_id, user, products, created_at: new Date() };

    await esClient.index({
      index: "orders",
      id: order_id.toString(),
      body: order,
    });

    const created_order = {
      id: order_id,
      ...order,
    };

    res.status(201).json({ message: "Order stored", order: created_order });
  } catch (error) {
    console.error("Error occurred while processing order:", error);
    console.error("Error details:", error.stack);
    if (error instanceof errors.ConfigurationError) {
      res.status(500).json({ error: "Elasticsearch configuration error" });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
});

const checkOrdersIndex = async () => {
  try {
    const indices = await esClient.cat.indices({ format: "json" });

    const ordersIndex = indices.find((index) => index.index === "orders");
    if (!ordersIndex) {
      await esClient.indices.create({
        index: "orders",
        body: {
          mappings: {
            properties: {
              orderId: { type: "integer" },
              user: { type: "text" },
              products: { type: "nested" },
              createdAt: { type: "date" },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error checking or creating orders index:", error);
  }
};

const checkClusterHealth = async () => {
  try {
    const health = await esClient.cluster.health();
  } catch (error) {
    console.error("Error checking cluster health:", error);
  }
};

checkOrdersIndex();
checkClusterHealth();

module.exports = router;
