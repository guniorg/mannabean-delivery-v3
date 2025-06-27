import { 
  menuItems, 
  orders, 
  orderItems,
  popups,
  categories,
  type MenuItem, 
  type InsertMenuItem,
  type UpdateMenuItem,
  type Order, 
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
  type Popup,
  type InsertPopup,
  type UpdatePopup,
  type Category,
  type InsertCategory,
  type UpdateCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

export interface IStorage {
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: UpdateMenuItem): Promise<MenuItem | undefined>;
  
  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: UpdateCategory): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Popups
  getPopups(): Promise<Popup[]>;
  getActivePopup(): Promise<Popup | undefined>;
  getPopup(id: number): Promise<Popup | undefined>;
  createPopup(popup: InsertPopup): Promise<Popup>;
  updatePopup(id: number, updates: UpdatePopup): Promise<Popup | undefined>;
  deletePopup(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private popups: Map<number, Popup>;
  private categories: Map<number, Category>;
  private currentMenuId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentPopupId: number;
  private currentCategoryId: number;
  private orderCounter: number;
  private readonly dataDir = path.join(process.cwd(), 'server/data');
  private readonly menuItemsFile = path.join(this.dataDir, 'menu-items.json');
  private readonly ordersFile = path.join(this.dataDir, 'orders.json');
  private readonly categoriesFile = path.join(this.dataDir, 'categories.json');

  constructor() {
    this.menuItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.popups = new Map();
    this.categories = new Map();
    this.currentMenuId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentPopupId = 1;
    this.currentCategoryId = 1;
    this.orderCounter = 1;
    
    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private loadData() {
    this.loadMenuItems();
    this.loadCategories();
    this.loadOrders();
  }

  private loadMenuItems() {
    try {
      if (fs.existsSync(this.menuItemsFile)) {
        const data = fs.readFileSync(this.menuItemsFile, 'utf8');
        const menuItems: MenuItem[] = JSON.parse(data);
        menuItems.forEach(item => {
          this.menuItems.set(item.id, item);
          if (item.id >= this.currentMenuId) {
            this.currentMenuId = item.id + 1;
          }
        });
      } else {
        this.initializeMenuItems();
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      this.initializeMenuItems();
    }
  }

  private saveMenuItems() {
    try {
      const menuItems = Array.from(this.menuItems.values());
      fs.writeFileSync(this.menuItemsFile, JSON.stringify(menuItems, null, 2));
    } catch (error) {
      console.error('Error saving menu items:', error);
    }
  }

  private loadCategories() {
    try {
      if (fs.existsSync(this.categoriesFile)) {
        const data = fs.readFileSync(this.categoriesFile, 'utf8');
        const categories: Category[] = JSON.parse(data);
        categories.forEach(category => {
          this.categories.set(category.id, category);
          if (category.id >= this.currentCategoryId) {
            this.currentCategoryId = category.id + 1;
          }
        });
      } else {
        this.initializeCategories();
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.initializeCategories();
    }
  }

  private saveCategories() {
    try {
      const categories = Array.from(this.categories.values());
      fs.writeFileSync(this.categoriesFile, JSON.stringify(categories, null, 2));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  private loadOrders() {
    try {
      if (fs.existsSync(this.ordersFile)) {
        const data = fs.readFileSync(this.ordersFile, 'utf8');
        const ordersData = JSON.parse(data);
        if (ordersData.orders) {
          ordersData.orders.forEach((order: Order) => {
            this.orders.set(order.id, order);
            if (order.id >= this.currentOrderId) {
              this.currentOrderId = order.id + 1;
            }
          });
        }
        if (ordersData.orderItems) {
          ordersData.orderItems.forEach((item: OrderItem) => {
            this.orderItems.set(item.id, item);
            if (item.id >= this.currentOrderItemId) {
              this.currentOrderItemId = item.id + 1;
            }
          });
        }
        if (ordersData.orderCounter) {
          this.orderCounter = ordersData.orderCounter;
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  private saveOrders() {
    try {
      const ordersData = {
        orders: Array.from(this.orders.values()),
        orderItems: Array.from(this.orderItems.values()),
        orderCounter: this.orderCounter
      };
      fs.writeFileSync(this.ordersFile, JSON.stringify(ordersData, null, 2));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  private initializeCategories() {
    const initialCategories = [
      { name: 'soup', displayName: '국물요리 (Soup Dishes)', isVisible: true, sortOrder: 1 },
      { name: 'noodles', displayName: '면류 (Noodles)', isVisible: true, sortOrder: 2 },
      { name: 'rice', displayName: '밥류 (Rice Dishes)', isVisible: true, sortOrder: 3 },
      { name: 'meat', displayName: '고기요리 (Meat Dishes)', isVisible: true, sortOrder: 4 },
      { name: 'appetizer', displayName: '안주/전류 (Appetizers)', isVisible: true, sortOrder: 5 },
      { name: 'hotpot', displayName: '전골류 (Hot Pot)', isVisible: true, sortOrder: 6 }
    ];

    initialCategories.forEach(categoryData => {
      const category: Category = {
        id: this.currentCategoryId++,
        name: categoryData.name,
        displayName: categoryData.displayName,
        isVisible: categoryData.isVisible,
        sortOrder: categoryData.sortOrder,
        createdAt: new Date()
      };
      this.categories.set(category.id, category);
    });
    this.saveCategories();
  }

  private initializeMenuItems() {
    const initialMenuItems = [
      // 국물요리
      { name: '곰탕', price: 140000, image: '/api/menu-images/gomtang.jpg', category: 'soup' },
      { name: '순두부찌개', price: 140000, image: '/api/menu-images/soondubu.jpg', category: 'soup' },
      { name: '갈비탕', price: 198000, image: '/api/menu-images/galbitang.jpg', category: 'soup' },
      { name: '비지찌개', price: 140000, image: '/api/menu-images/biji.jpg', category: 'soup' },
      { name: '순어탕', price: 140000, image: '/api/menu-images/soonuh.jpg', category: 'soup' },
      { name: '해장국', price: 140000, image: '/api/menu-images/haejangguk.jpg', category: 'soup' },
      { name: '김치찌개', price: 140000, image: '/api/menu-images/kimchi.jpg', category: 'soup' },
      { name: '안주국', price: 140000, image: '/api/menu-images/anjuguk.jpg', category: 'soup' },
      
      // 면류
      { name: '콩국수', price: 140000, image: '/api/menu-images/kongguksu.jpg', category: 'noodles' },
      { name: '물냉면', price: 140000, image: '/api/menu-images/mulnaengmyeon.jpg', category: 'noodles' },
      { name: '비빔냉면', price: 140000, image: '/api/menu-images/bibimnaengmyeon.jpg', category: 'noodles' },
      { name: '해물라면', price: 140000, image: '/api/menu-images/haemul-ramen.jpg', category: 'noodles' },
      
      // 밥류
      { name: '비빔밥', price: 120000, image: '/api/menu-images/bibimbap.jpg', category: 'rice' },
      
      // 고기요리
      { name: '뚝불고기', price: 190000, image: '/api/menu-images/dduk-bulgogi.jpg', category: 'meat' },
      { name: '제육볶음', price: 140000, image: '/api/menu-images/jeyuk.jpg', category: 'meat' },
      { name: '오삼불고기', price: 450000, image: '/api/menu-images/osam-bulgogi.jpg', category: 'meat' },
      { name: '보쌈', price: 400000, image: '/api/menu-images/bossam.jpg', category: 'meat' },
      { name: '차돌박이', price: 1700000, image: '/api/menu-images/chadolbagi.jpg', category: 'meat' },
      
      // 안주/전류
      { name: '군만두', price: 70000, image: '/api/menu-images/gunmandu.jpg', category: 'appetizer' },
      { name: '감자전', price: 140000, image: '/api/menu-images/gamjajeon.jpg', category: 'appetizer' },
      { name: '해물파전', price: 250000, image: '/api/menu-images/haemul-pajeon.jpg', category: 'appetizer' },
      
      // 전골류
      { name: '만두전골', price: 400000, image: '/api/menu-images/mandu-jeongol.jpg', category: 'hotpot' },
      { name: '두부전골', price: 300000, image: '/api/menu-images/dubu-jeongol.jpg', category: 'hotpot' },
      { name: '비석불고기전골', price: 400000, image: '/api/menu-images/biseok-bulgogi.jpg', category: 'hotpot' }
    ];

    initialMenuItems.forEach(item => {
      const menuItem: MenuItem = {
        id: this.currentMenuId++,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        available: true,
        isVisible: true
      };
      this.menuItems.set(menuItem.id, menuItem);
    });
    this.saveMenuItems();
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.available);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuId++;
    const menuItem: MenuItem = {
      id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category || 'main',
      available: item.available ?? true,
      isVisible: item.isVisible ?? true
    };
    this.menuItems.set(id, menuItem);
    this.saveMenuItems();
    return menuItem;
  }

  async updateMenuItem(id: number, updates: UpdateMenuItem): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;
    
    const updated: MenuItem = { ...existing, ...updates };
    this.menuItems.set(id, updated);
    this.saveMenuItems();
    return updated;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const menuItem = this.menuItems.get(item.menuItemId);
        return {
          ...item,
          menuItem: menuItem || {
            id: item.menuItemId,
            name: item.menuItemName,
            price: item.price,
            image: '',
            category: 'unknown',
            available: false
          }
        };
      });

    return { ...order, items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const id = this.currentOrderId++;
    const orderNumber = `MB-${String(this.orderCounter++).padStart(3, '0')}`;
    
    const newOrder: Order = {
      id,
      orderNumber,
      orderType: order.orderType,
      customerName: order.customerName || null,
      customerPhone: order.customerPhone || null,
      deliveryLocation: order.deliveryLocation || null,
      detailAddress: order.detailAddress || null,
      customAddress: order.customAddress || null,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee || 0,
      tax: order.tax || 0,
      total: order.total,
      status: 'pending',
      estimatedDeliveryTime: order.estimatedDeliveryTime || null,
      createdAt: new Date(),
    };
    
    this.orders.set(id, newOrder);

    const orderItemsWithMenu = [];
    for (const item of items) {
      const orderItemId = this.currentOrderItemId++;
      const menuItem = this.menuItems.get(item.menuItemId);
      
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id,
        menuItemName: menuItem?.name || 'Unknown Item'
      };
      
      this.orderItems.set(orderItemId, orderItem);
      orderItemsWithMenu.push({
        ...orderItem,
        menuItem: menuItem || {
          id: item.menuItemId,
          name: orderItem.menuItemName,
          price: item.price,
          image: '',
          category: 'unknown',
          available: false
        }
      });
    }

    return { ...newOrder, items: orderItemsWithMenu };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    
    const updated: Order = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(order => order.orderNumber === orderNumber);
  }

  // Popup methods
  async getPopups(): Promise<Popup[]> {
    return Array.from(this.popups.values());
  }

  async getActivePopup(): Promise<Popup | undefined> {
    const now = new Date();
    return Array.from(this.popups.values()).find(popup => 
      popup.isActive && 
      (!popup.startDate || popup.startDate <= now) && 
      (!popup.endDate || popup.endDate >= now)
    );
  }

  async getPopup(id: number): Promise<Popup | undefined> {
    return this.popups.get(id);
  }

  async createPopup(popupData: InsertPopup): Promise<Popup> {
    const popup: Popup = {
      id: this.currentPopupId++,
      title: popupData.title,
      description: popupData.description ?? null,
      imageUrl: popupData.imageUrl ?? null,
      isActive: popupData.isActive ?? true,
      startDate: popupData.startDate ?? null,
      endDate: popupData.endDate ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.popups.set(popup.id, popup);
    return popup;
  }

  async updatePopup(id: number, updates: UpdatePopup): Promise<Popup | undefined> {
    const existing = this.popups.get(id);
    if (!existing) return undefined;

    const updated: Popup = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.popups.set(id, updated);
    return updated;
  }

  async deletePopup(id: number): Promise<boolean> {
    return this.popups.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      name: categoryData.name,
      displayName: categoryData.displayName,
      isVisible: categoryData.isVisible ?? true,
      sortOrder: categoryData.sortOrder ?? 0,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updates: UpdateCategory): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated: Category = { 
      ...existing, 
      ...updates
    };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const items = await db.select().from(menuItems).orderBy(menuItems.id);
    return items;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: number, updates: UpdateMenuItem): Promise<MenuItem | undefined> {
    const [updated] = await db
      .update(menuItems)
      .set(updates)
      .where(eq(menuItems.id, id))
      .returning();
    return updated;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const orderList = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return orderList;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          price: menuItems.price,
          image: menuItems.image,
          category: menuItems.category,
          available: menuItems.available,
          isVisible: menuItems.isVisible,
        },
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items: items as (OrderItem & { menuItem: MenuItem })[],
    };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderNumber = `ORD${Date.now()}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    const newOrderItems = await db
      .insert(orderItems)
      .values(items.map(item => ({ ...item, orderId: newOrder.id })))
      .returning();

    const itemsWithMenu = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        menuItemId: orderItems.menuItemId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        menuItem: {
          id: menuItems.id,
          name: menuItems.name,
          price: menuItems.price,
          image: menuItems.image,
          category: menuItems.category,
          available: menuItems.available,
          isVisible: menuItems.isVisible,
        },
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, newOrder.id));

    return {
      ...newOrder,
      items: itemsWithMenu as (OrderItem & { menuItem: MenuItem })[],
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categoryList = await db.select().from(categories).orderBy(categories.sortOrder);
    return categoryList;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, updates: UpdateCategory): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Popups
  async getPopups(): Promise<Popup[]> {
    const popupList = await db.select().from(popups).orderBy(desc(popups.createdAt));
    return popupList;
  }

  async getActivePopup(): Promise<Popup | undefined> {
    const now = new Date();
    const [popup] = await db
      .select()
      .from(popups)
      .where(eq(popups.isActive, true))
      .limit(1);
    return popup;
  }

  async getPopup(id: number): Promise<Popup | undefined> {
    const [popup] = await db.select().from(popups).where(eq(popups.id, id));
    return popup;
  }

  async createPopup(popup: InsertPopup): Promise<Popup> {
    const [newPopup] = await db.insert(popups).values(popup).returning();
    return newPopup;
  }

  async updatePopup(id: number, updates: UpdatePopup): Promise<Popup | undefined> {
    const [updated] = await db
      .update(popups)
      .set(updates)
      .where(eq(popups.id, id))
      .returning();
    return updated;
  }

  async deletePopup(id: number): Promise<boolean> {
    await db.delete(popups).where(eq(popups.id, id));
    return true;
  }
}

// Initialize database with existing data
async function initializeDatabase() {
  try {
    // Check if menu items already exist
    const existingItems = await db.select().from(menuItems).limit(1);
    if (existingItems.length > 0) {
      console.log('Database already initialized');
      return;
    }

    // Read existing menu data from JSON file
    const dataDir = path.join(process.cwd(), 'server/data');
    const menuItemsFile = path.join(dataDir, 'menu-items.json');
    
    if (fs.existsSync(menuItemsFile)) {
      const menuData = JSON.parse(fs.readFileSync(menuItemsFile, 'utf-8'));
      console.log('Migrating existing menu data to database...');
      
      // Insert menu items with specific IDs
      for (const item of menuData) {
        await db.insert(menuItems).values({
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          available: item.available ?? true,
          isVisible: item.isVisible ?? true
        }).onConflictDoNothing();
      }
      
      console.log('Menu data migration completed');
    } else {
      console.log('No existing menu data found, initializing with defaults...');
      // Initialize with default menu items (your existing initialization code)
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Create storage instance and initialize
export const storage = new DatabaseStorage();

// Initialize database on startup
initializeDatabase();
