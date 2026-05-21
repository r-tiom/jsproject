import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { User, Product, Order, OrderItem, OrderStatus } from './src/types';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'ONLINE_STORE_SUPER_SECRET_KEY_123';

app.use(express.json());

// Interface for Auth requests
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
}

// Authentication Middleware
function protect(req: AuthRequest, res: Response, next: NextFunction) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'admin' | 'user' };
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Ошибка авторизации: недействительный токен' });
    }
  }
  return res.status(401).json({ message: 'Нет авторизации, отсутствует токен' });
}

// Admin Middleware
function admin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Доступ запрещен, требуются права администратора' });
  }
}

// Generate JWT Token
function generateToken(id: string, email: string, role: string) {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '30d' });
}

// --- API ROUTES ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Auth: Registration
app.post('/api/users/register', (req, res) => {
  const { name, email, password, address, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Пожалуйста, заполните имя, email и пароль' });
  }

  // Check if exists
  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
  }

  // Create user
  const id = 'user-' + Math.random().toString(36).substr(2, 9);
  const passwordHash = bcrypt.hashSync(password, 10);
  
  const newUser: User = {
    id,
    name,
    email: email.toLowerCase(),
    role: 'user', // default registration is simple user
    address: address || '',
    phone: phone || '',
    createdAt: new Date().toISOString()
  };

  db.createUser({ ...newUser, passwordHash });

  res.status(201).json({
    token: generateToken(id, newUser.email, newUser.role),
    user: newUser
  });
});

// 3. Auth: Login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Пожалуйста, укажите email и пароль' });
  }

  const userRecord = db.findUserByEmail(email);
  if (!userRecord) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const isMatch = bcrypt.compareSync(password, userRecord.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Неверный email или пароль' });
  }

  const userResponse: User = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    address: userRecord.address,
    phone: userRecord.phone,
    createdAt: userRecord.createdAt
  };

  res.json({
    token: generateToken(userResponse.id, userResponse.email, userResponse.role),
    user: userResponse
  });
});

// 4. Auth: Get User Profile
app.get('/api/users/profile', protect, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Неавторизован' });
  
  const userRecord = db.findUserById(req.user.id);
  if (!userRecord) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const profile: User = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
    address: userRecord.address,
    phone: userRecord.phone,
    createdAt: userRecord.createdAt
  };

  res.json(profile);
});

// 5. Auth: Update User Profile
app.put('/api/users/profile', protect, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Неавторизован' });

  const { name, address, phone, password } = req.body;
  
  const userRecord = db.findUserById(req.user.id);
  if (!userRecord) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const updates: Partial<User & { passwordHash: string }> = {};
  if (name) updates.name = name;
  if (address !== undefined) updates.address = address;
  if (phone !== undefined) updates.phone = phone;
  if (password) {
    updates.passwordHash = bcrypt.hashSync(password, 10);
  }

  const updatedRecord = db.updateUser(req.user.id, updates);
  if (!updatedRecord) {
    return res.status(400).json({ message: 'Не удалось обновить профиль' });
  }

  const profile: User = {
    id: updatedRecord.id,
    name: updatedRecord.name,
    email: updatedRecord.email,
    role: updatedRecord.role,
    address: updatedRecord.address,
    phone: updatedRecord.phone,
    createdAt: updatedRecord.createdAt
  };

  res.json(profile);
});

// 6. Products: Get all with search/filter
app.get('/api/products', (req, res) => {
  const { search, category } = req.query;
  let products = db.getProducts();

  if (category && category !== 'Все') {
    products = products.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const searchTerm = (search as string).toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  res.json(products);
});

// 7. Products: Get single product
app.get('/api/products/:id', (req, res) => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }
  res.json(product);
});

// 8. Products: Create new product (Admin preferred)
app.post('/api/products', protect, admin, (req: AuthRequest, res) => {
  const { name, description, price, image, category, countInStock } = req.body;

  if (!name || !description || price === undefined || !image || !category || countInStock === undefined) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля товара' });
  }

  const newProduct: Product = {
    id: 'prod-' + Math.random().toString(36).substr(2, 9),
    name,
    description,
    price: Number(price),
    image,
    category,
    countInStock: Number(countInStock),
    rating: 5.0,
    numReviews: 0
  };

  db.createProduct(newProduct);
  res.status(201).json(newProduct);
});

// 9. Products: Update product details (Admin preferred)
app.put('/api/products/:id', protect, admin, (req: AuthRequest, res) => {
  const { name, description, price, image, category, countInStock } = req.body;
  const product = db.findProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Товар не найден' });
  }

  const updates: Partial<Product> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = Number(price);
  if (image !== undefined) updates.image = image;
  if (category !== undefined) updates.category = category;
  if (countInStock !== undefined) updates.countInStock = Number(countInStock);

  const updatedProduct = db.updateProduct(req.params.id, updates);
  res.json(updatedProduct);
});

// 10. Products: Delete product (Admin preferred)
app.delete('/api/products/:id', protect, admin, (req: AuthRequest, res) => {
  const deleted = db.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Товар не найден' });
  }
  res.json({ message: 'Товар успешно удален', product: deleted });
});

// 11. Orders: Place new order
app.post('/api/orders', protect, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Неавторизован' });

  const { 
    orderItems, 
    shippingAddress, 
    shippingCity, 
    shippingPostalCode, 
    shippingPhone,
    paymentMethod,
    paymentDetails,
    itemsPrice, 
    shippingPrice, 
    taxPrice, 
    totalPrice 
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'Корзина пуста' });
  }

  // Validate quantities and availability
  for (const item of orderItems) {
    const originalProd = db.findProductById(item.product.id);
    if (!originalProd) {
      return res.status(404).json({ message: `Товар "${item.product.name}" не найден в каталоге` });
    }
    if (originalProd.countInStock < item.quantity) {
      return res.status(400).json({ message: `Товар "${item.product.name}" недоступен в нужном количестве (в наличии: ${originalProd.countInStock})` });
    }
  }

  // Get user profile details
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(401).json({ message: 'Пользователь не найден' });
  }

  const orderId = 'order-' + Math.random().toString(36).substr(2, 9);
  
  const formattedItems: OrderItem[] = orderItems.map((item: any) => ({
    id: 'item-' + Math.random().toString(36).substr(2, 9),
    product: item.product,
    quantity: item.quantity,
    price: item.product.price
  }));

  const newOrder: Order = {
    id: orderId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    orderItems: formattedItems,
    shippingAddress,
    shippingCity,
    shippingPostalCode,
    shippingPhone,
    paymentMethod,
    paymentDetails,
    itemsPrice: Number(itemsPrice),
    shippingPrice: Number(shippingPrice),
    taxPrice: Number(taxPrice),
    totalPrice: Number(totalPrice),
    status: 'Pending',
    isPaid: paymentMethod === 'Card', // Cards are instantly paid in simulation
    paidAt: paymentMethod === 'Card' ? new Date().toISOString() : undefined,
    isDelivered: false,
    createdAt: new Date().toISOString()
  };

  db.createOrder(newOrder);

  // If user profile didn't have phone/address, update it with these shipping details
  const profileUpdates: Partial<User> = {};
  if (!user.address && shippingAddress) profileUpdates.address = `${shippingAddress}, ${shippingCity}`;
  if (!user.phone && shippingPhone) profileUpdates.phone = shippingPhone;
  if (Object.keys(profileUpdates).length > 0) {
    db.updateUser(user.id, profileUpdates);
  }

  res.status(201).json(newOrder);
});

// 12. Orders: Get personal orders
app.get('/api/orders/myorders', protect, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Неавторизован' });
  const orders = db.findOrdersByUserId(req.user.id);
  res.json(orders);
});

// 13. Orders: Get personal or admin order by ID
app.get('/api/orders/:id', protect, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ message: 'Неавторизован' });
  
  const order = db.findOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }

  // Check permissions: either belongs to user, or is admin
  if (order.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ ограничен: этот заказ принадлежит другому пользователю' });
  }

  res.json(order);
});

// 14. Orders: Get ALL orders (Admin only)
app.get('/api/orders', protect, admin, (req: AuthRequest, res) => {
  res.json(db.getOrders());
});

// 15. Orders: Update order status (Admin only)
app.put('/api/orders/:id/status', protect, admin, (req: AuthRequest, res) => {
  const { status, isDelivered, isPaid } = req.body;
  const order = db.findOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Заказ не найден' });
  }

  const updates: Partial<Order> = {};
  if (status !== undefined) updates.status = status as OrderStatus;
  
  if (isDelivered !== undefined) {
    updates.isDelivered = isDelivered;
    if (isDelivered) {
      updates.deliveredAt = new Date().toISOString();
      updates.status = 'Delivered';
    }
  }

  if (isPaid !== undefined) {
    updates.isPaid = isPaid;
    if (isPaid) {
      updates.paidAt = new Date().toISOString();
    }
  }

  const updatedOrder = db.updateOrder(req.params.id, updates);
  res.json(updatedOrder);
});

// 16. Admin Dashboard: Get general stats
app.get('/api/admin/stats', protect, admin, (req: AuthRequest, res) => {
  const products = db.getProducts();
  const orders = db.getOrders();
  const users = db.getUsers();

  const totalSales = orders
    .filter(o => o.isPaid)
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;

  // Breakdown sales by category
  const salesByCategory: Record<string, number> = {};
  for (const order of orders) {
    if (!order.isPaid) continue;
    for (const item of order.orderItems) {
      const category = item.product.category;
      const salesVal = item.price * item.quantity;
      salesByCategory[category] = (salesByCategory[category] || 0) + salesVal;
    }
  }

  // Monthly breakdown (simple aggregation of last orders)
  const monthlySalesMap: Record<string, number> = {};
  for (const order of orders) {
    if (!order.isPaid) continue;
    const date = new Date(order.createdAt);
    // e.g. "May", "Jun" (Using Russian months)
    const monthName = date.toLocaleString('ru-RU', { month: 'short' });
    monthlySalesMap[monthName] = (monthlySalesMap[monthName] || 0) + order.totalPrice;
  }

  const monthlySales = Object.keys(monthlySalesMap).map(m => ({
    month: m.charAt(0).toUpperCase() + m.slice(1),
    sales: Number(monthlySalesMap[m].toFixed(2))
  }));

  res.json({
    totalSales: Number(totalSales.toFixed(2)),
    totalOrders,
    totalProducts,
    totalUsers,
    salesByCategory,
    monthlySales: monthlySales.length > 0 ? monthlySales : [{ month: 'Сегодня', sales: totalSales }],
    recentOrders: orders.slice(0, 5)
  });
});

// --- VITE MIDDLEWARE AND SPA FALLBACK ---

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Ready: Mounted running Vite middleware in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Ready: Serving static production build assets.');
  }

  app.listen(Number(PORT), HOST, () => {
    console.log(`Server actively responsive or listening at http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal initialization failure:', err);
});
