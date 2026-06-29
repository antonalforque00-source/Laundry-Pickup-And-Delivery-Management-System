import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { db } from "./src/db/index.ts";
import { users, orders, inventory, alerts } from "./src/db/schema.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { eq, or, and, desc } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Helper function to send sanitized errors
  const sendError = (res: express.Response, error: any, message = "Internal Server Error") => {
    console.error(message, error);
    res.status(500).json({ error: message, details: error.message });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth/Sync User
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, email } = req.body;
      const user = await getOrCreateUser(req.user!.uid, email || req.user!.email || "", name || req.user!.name || "New User");
      res.json(user);
    } catch (error) {
      sendError(res, error, "Failed to sync user");
    }
  });

  // Get current user details
  app.get("/api/users/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (!user.length) return res.status(404).json({ error: "User not found" });
      res.json(user[0]);
    } catch (error) {
      sendError(res, error, "Failed to get user");
    }
  });

  // Orders API
  app.get("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userRecord = await db.select().from(users).where(eq(users.uid, req.user!.uid));
      if (!userRecord.length) return res.status(404).json({ error: "User not found" });
      const role = userRecord[0].role;
      
      let query;
      if (role === 'customer') {
        query = db.select().from(orders).where(eq(orders.customerId, req.user!.uid)).orderBy(desc(orders.createdAt));
      } else if (role === 'rider') {
        // Riders see pending/scheduled pickups, or deliveries assigned to them
        query = db.select().from(orders)
          .where(
            or(
              eq(orders.status, 'Pending'),
              eq(orders.status, 'Pickup Scheduled'),
              eq(orders.status, 'Ready for Delivery'),
              eq(orders.status, 'Out for Delivery')
            )
          ).orderBy(desc(orders.createdAt));
      } else {
        // Admin and Staff see all orders
        query = db.select().from(orders).orderBy(desc(orders.createdAt));
      }
      const result = await query;
      res.json(result);
    } catch (error) {
      sendError(res, error, "Failed to fetch orders");
    }
  });

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { customerName, address, phone, serviceType, pickupDate, paymentMethod, specialInstructions } = req.body;
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      
      const newOrder = await db.insert(orders).values({
        orderNumber,
        customerId: req.user!.uid,
        customerName,
        address,
        phone,
        serviceType,
        pickupDate,
        paymentMethod,
        specialInstructions,
        status: 'Pending',
      }).returning();
      
      res.json(newOrder[0]);
    } catch (error) {
      sendError(res, error, "Failed to create order");
    }
  });

  app.put("/api/orders/:id/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      const id = parseInt(req.params.id);
      
      const updatedOrder = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();
        
      res.json(updatedOrder[0]);
    } catch (error) {
      sendError(res, error, "Failed to update order status");
    }
  });

  app.put("/api/orders/:id/weight", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { weight } = req.body;
      const id = parseInt(req.params.id);
      
      const updatedOrder = await db.update(orders)
        .set({ weight })
        .where(eq(orders.id, id))
        .returning();
        
      res.json(updatedOrder[0]);
    } catch (error) {
      sendError(res, error, "Failed to update order weight");
    }
  });

  // Alerts API
  app.get("/api/alerts", requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await db.select().from(alerts)
        .where(eq(alerts.userId, req.user!.uid))
        .orderBy(desc(alerts.id));
      res.json(result);
    } catch (error) {
      sendError(res, error, "Failed to fetch alerts");
    }
  });

  // Inventory API
  app.get("/api/inventory", requireAuth, async (req: AuthRequest, res) => {
    try {
      const result = await db.select().from(inventory).orderBy(inventory.name);
      res.json(result);
    } catch (error) {
      sendError(res, error, "Failed to fetch inventory");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
