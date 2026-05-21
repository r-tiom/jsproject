import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Product, Order } from '../src/types';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Types for DB structure
export interface DbSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
}

// Initial seeding helper
const seedProducts: Product[] = [
  // Electronics
  {
    id: 'prod-1',
    name: 'Aether Wireless Headphones',
    description: 'Immersive sound experience with adaptive hybrid active noise cancellation, high-resolution audio driver, and 45h battery life.',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 15,
    rating: 4.8,
    numReviews: 124
  },
  {
    id: 'prod-2',
    name: 'Chroma Mechanical Keyboard',
    description: 'Tactile mechanical blue switches with fully customizable RGB backlight, aluminum frame, and durable double-shot PBT keycaps.',
    price: 119.50,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 8,
    rating: 4.6,
    numReviews: 89
  },
  {
    id: 'prod-3',
    name: 'Vanguard Smart Fitness Watch',
    description: 'Always-on AMOLED display tracking sleep metrics, heart rate, blood oxygen levels, with full built-in GPS and sports mapping controls.',
    price: 249.00,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
    category: 'Electronics',
    countInStock: 12,
    rating: 4.7,
    numReviews: 56
  },
  {
    id: 'prod-4',
    name: 'Luminary Minimalist Desk Lamp',
    description: 'Sleek brushed brass body with double joints, multi-level warmth slider, and high CRI eye-care LED diffused backlighting.',
    price: 64.00,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
    category: 'Home & Living',
    countInStock: 22,
    rating: 4.9,
    numReviews: 42
  },
  // Apparel / Clothing
  {
    id: 'prod-5',
    name: 'Nomad Waxed Canvas Sneakers',
    description: 'Heavyweight organic cotton canvas treated with water-repellent natural wax, vulcanized natural crepe rubber soles, built for long walks.',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
    category: 'Clothing',
    countInStock: 18,
    rating: 4.5,
    numReviews: 95
  },
  {
    id: 'prod-6',
    name: 'Merino Wool Crewneck Sweater',
    description: 'Knitted with ultra-fine double-ply Australian Merino wool fibers, thermoregulating, soft, and naturally odor-resistant.',
    price: 110.00,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80',
    category: 'Clothing',
    countInStock: 10,
    rating: 4.7,
    numReviews: 73
  },
  {
    id: 'prod-7',
    name: 'Urban Explorer Trench Coat',
    description: 'Windproof, rain-shedding technical blend fabric lined with organic cotton flannel. Classic tailored styling for perfect formal-casual crossover.',
    price: 175.00,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80',
    category: 'Clothing',
    countInStock: 5,
    rating: 4.8,
    numReviews: 31
  },
  // Home & Living
  {
    id: 'prod-8',
    name: 'Terra Cotta Ceramic Pot Set',
    description: 'Set of three hand-fired low-relief clay pots, finished with organic reactive white glaze, drainage holes with subtle saucer trays included.',
    price: 49.00,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80',
    category: 'Home & Living',
    countInStock: 25,
    rating: 4.4,
    numReviews: 19
  },
  {
    id: 'prod-9',
    name: 'Artisan Glass Coffee Carafe',
    description: 'Heat-resistant borosilicate glass server with double wall insulation and protective olive-wood collar for perfect manual drip brewing.',
    price: 36.50,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    category: 'Home & Living',
    countInStock: 14,
    rating: 4.6,
    numReviews: 61
  },
  // Books & Dev tools
  {
    id: 'prod-10',
    name: 'Clean Code (Paperback)',
    description: 'A Handbook of Agile Software Craftsmanship, written by legendary Robert C. Martin. Absolute goldmine for engineering high-quality maintainable systems.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    category: 'Books',
    countInStock: 10,
    rating: 4.9,
    numReviews: 340
  },
  {
    id: 'prod-11',
    name: 'Refactoring: Improving Code Design',
    description: 'Renowned work by Martin Fowler outlining systematic practices of reorganizing existing code arrays without mutating outward behavior.',
    price: 44.50,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=80',
    category: 'Books',
    countInStock: 6,
    rating: 4.8,
    numReviews: 185
  }
];

export class Database {
  private data: DbSchema = {
    users: [],
    products: [],
    orders: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure lists exist
        this.data.users = this.data.users || [];
        this.data.products = this.data.products || [];
        this.data.orders = this.data.orders || [];
      } else {
        // Seed database
        console.log('Database not found. Seeding initial data...');
        const adminPasswordHash = bcrypt.hashSync('admin123', 10);
        const userPasswordHash = bcrypt.hashSync('user123', 10);

        this.data = {
          users: [
            {
              id: 'user-admin',
              name: 'Администратор Магазина',
              email: 'admin@example.com',
              role: 'admin',
              address: 'ул. Главная, д. 10',
              phone: '+7 (999) 000-1111',
              passwordHash: adminPasswordHash,
              createdAt: new Date().toISOString()
            },
            {
              id: 'user-demo',
              name: 'Иван Иванов',
              email: 'user@example.com',
              role: 'user',
              address: 'Ленинский проспект, д. 45, кв. 112',
              phone: '+7 (911) 222-3344',
              passwordHash: userPasswordHash,
              createdAt: new Date().toISOString()
            }
          ],
          products: seedProducts,
          orders: []
        };
        this.save();
      }
    } catch (error) {
      console.error('Error initializing Database:', error);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving Database to disk:', error);
    }
  }

  // --- Users Table API ---
  public getUsers() {
    return this.data.users;
  }

  public findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash: string }>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates } as typeof this.data.users[number];
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // --- Products Table API ---
  public getProducts() {
    return this.data.products;
  }

  public findProductById(id: string) {
    return this.data.products.find(p => p.id === id);
  }

  public createProduct(product: Product) {
    this.data.products.unshift(product); // Add to the beginning
    this.save();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates };
      this.save();
      return this.data.products[idx];
    }
    return null;
  }

  public deleteProduct(id: string) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = this.data.products.splice(idx, 1)[0];
      this.save();
      return removed;
    }
    return null;
  }

  // --- Orders Table API ---
  public getOrders() {
    return this.data.orders;
  }

  public findOrderById(id: string) {
    return this.data.orders.find(o => o.id === id);
  }

  public findOrdersByUserId(userId: string) {
    return this.data.orders.filter(o => o.userId === userId);
  }

  public createOrder(order: Order) {
    // Reduce product stocks
    for (const item of order.orderItems) {
      const prod = this.findProductById(item.product.id);
      if (prod) {
        prod.countInStock = Math.max(0, prod.countInStock - item.quantity);
      }
    }
    this.data.orders.unshift(order); // New orders at the top
    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates } as Order;
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }
}

export const db = new Database();
