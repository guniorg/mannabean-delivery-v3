import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Price in VND
  image: text("image").notNull(),
  category: text("category").notNull().default("main"),
  available: boolean("available").notNull().default(true),
  isVisible: boolean("is_visible").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  orderType: text("order_type").notNull(), // 'delivery' or 'pickup'
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  deliveryLocation: text("delivery_location"), // 'kalidas', 'kyeongnamA', 'kyeongnamB', 'other'
  detailAddress: text("detail_address"),
  customAddress: text("custom_address"),
  paymentMethod: text("payment_method").notNull(), // 'cash' or 'transfer'
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  tax: integer("tax").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'preparing', 'ready', 'delivered'
  estimatedDeliveryTime: integer("estimated_delivery_time"), // in minutes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull().references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // Price at time of order
  menuItemName: text("menu_item_name").notNull(), // Store name for historical records
});

export const popups = pgTable("popups", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(false).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  orderId: true,
});

export const updateMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
}).partial();

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const updateCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
}).partial();

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type OrderWithItems = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
};

export const insertPopupSchema = createInsertSchema(popups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePopupSchema = createInsertSchema(popups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Popup = typeof popups.$inferSelect;
export type InsertPopup = z.infer<typeof insertPopupSchema>;
export type UpdatePopup = z.infer<typeof updatePopupSchema>;
