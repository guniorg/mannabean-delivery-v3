import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema, updateMenuItemSchema, insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Menu images mapping
const menuImages: Record<string, string> = {
  'gomtang.jpg': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'soondubu.jpg': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'bibimbap.jpg': 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'galbitang.jpg': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'biji.jpg': 'https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'soonuh.jpg': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'haejangguk.jpg': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'kongguksu.jpg': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'kimchi.jpg': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'dduk-bulgogi.jpg': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'mulnaengmyeon.jpg': 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'bibimnaengmyeon.jpg': 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'haemul-ramen.jpg': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'anjuguk.jpg': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'gunmandu.jpg': 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'jeyuk.jpg': 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'gamjajeon.jpg': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'haemul-pajeon.jpg': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'mandu-jeongol.jpg': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'dubu-jeongol.jpg': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'osam-bulgogi.jpg': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'bossam.jpg': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'biseok-bulgogi.jpg': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
  'chadolbagi.jpg': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Menu Image Route
  app.get("/api/menu-images/:filename", (req, res) => {
    const filename = req.params.filename;
    const imageUrl = menuImages[filename];
    
    if (imageUrl) {
      res.redirect(imageUrl);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Menu Items Routes
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.patch("/api/menu/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = updateMenuItemSchema.parse(req.body);
      
      const updated = await storage.updateMenuItem(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  // Create new menu item
  app.post("/api/menu", async (req, res) => {
    try {
      const newItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(newItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  // Upload menu item image
  app.post("/api/menu/:id/upload-image", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Update menu item with new image path
      const imageUrl = `/uploads/${req.file.filename}`;
      const updated = await storage.updateMenuItem(id, { image: imageUrl });
      
      if (!updated) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json({ message: "Image uploaded successfully", imageUrl, menuItem: updated });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Upload menu image for new menu creation
  app.post("/api/upload-menu-image", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imagePath = `/uploads/${req.file.filename}`;
      res.json({ message: "Image uploaded successfully", imagePath });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Orders Routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderWithItems(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const createOrderSchema = z.object({
    order: insertOrderSchema,
    items: z.array(insertOrderItemSchema)
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = createOrderSchema.parse(req.body);
      
      if (items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      // Calculate estimated delivery time based on order type and location
      let estimatedDeliveryTime = 30; // Default 30 minutes
      
      if (order.orderType === 'delivery') {
        switch (order.deliveryLocation) {
          case 'kalidas':
            estimatedDeliveryTime = 25;
            break;
          case 'kyeongnamA':
            estimatedDeliveryTime = 30;
            break;
          case 'kyeongnamB':
            estimatedDeliveryTime = 35;
            break;
          case 'other':
            estimatedDeliveryTime = 45;
            break;
        }
      } else {
        estimatedDeliveryTime = 15; // Pickup/table reservation
      }
      
      const orderWithTime = {
        ...order,
        estimatedDeliveryTime,
        status: 'pending'
      };
      
      const createdOrder = await storage.createOrder(orderWithTime, items);
      
      // Send Slack notification
      try {
        const { sendOrderNotification } = await import('./slack');
        await sendOrderNotification(createdOrder);
      } catch (slackError) {
        console.error("Slack notification failed:", slackError);
        // Don't fail the order creation if Slack fails
      }
      
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.string() }).parse(req.body);
      
      const updated = await storage.updateOrderStatus(id, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send Slack status update notification
      try {
        const { sendOrderStatusUpdate } = await import('./slack');
        await sendOrderStatusUpdate(updated, status);
      } catch (slackError) {
        console.error("Slack status update failed:", slackError);
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/orders/number/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Popup Routes
  app.get("/api/popups", async (req, res) => {
    try {
      const popups = await storage.getPopups();
      res.json(popups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popups" });
    }
  });

  app.get("/api/popups/active", async (req, res) => {
    try {
      const popup = await storage.getActivePopup();
      res.json(popup || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active popup" });
    }
  });

  app.get("/api/popups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const popup = await storage.getPopup(id);
      
      if (!popup) {
        return res.status(404).json({ message: "Popup not found" });
      }
      
      res.json(popup);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popup" });
    }
  });

  app.post("/api/popups", async (req, res) => {
    try {
      const { insertPopupSchema } = await import("@shared/schema");
      const data = insertPopupSchema.parse(req.body);
      const popup = await storage.createPopup(data);
      res.status(201).json(popup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create popup" });
    }
  });

  app.patch("/api/popups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { updatePopupSchema } = await import("@shared/schema");
      const updates = updatePopupSchema.parse(req.body);
      
      const updated = await storage.updatePopup(id, updates);
      
      if (!updated) {
        return res.status(404).json({ message: "Popup not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update popup" });
    }
  });

  app.delete("/api/popups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePopup(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Popup not found" });
      }
      
      res.json({ message: "Popup deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete popup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
