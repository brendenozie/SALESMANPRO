db.Account.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b001"),
    userId: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    type: "oauth",
    provider: "google",
    providerAccountId: "1234567890",
    refresh_token: "refreshTokenExample",
    access_token: "accessTokenExample",
    expires_at: 1672531200,
    token_type: "Bearer",
    scope: "profile email",
    id_token: "idTokenExample",
    session_state: null
  }
]);

db.Session.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b002"),
    sessionToken: "sessionTokenExample",
    expires: new Date("2024-12-31T23:59:59.000Z"),
    userId: ObjectId("63f7c9e2d91b1b2a5e80b100")
  }
]);

db.VerificationToken.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b003"),
    identifier: "test@example.com",
    token: "verificationTokenExample",
    expires: new Date("2024-12-31T23:59:59.000Z")
  }
]);

db.Notification.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b004"),
    title: "Welcome!",
    message: "Thank you for joining our platform.",
    createdAt: new Date("2024-12-20T12:00:00.000Z"),
    read: false
  }
]);

db.ProductCategory.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b005"),
    name: "Electronics",
    image: "electronics.jpg",
    status: "Active",
    products: []
  },
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b006"),
    name: "Clothing",
    image: "clothing.jpg",
    status: "Active",
    products: []
  }
]);

// UsersCategory Collection
db.UsersCategory.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b007"),
    name: "Admins",
    status: "Active",
    users: []
  },
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b008"),
    name: "Regular Users",
    status: "Active",
    users: []
  }
]);

db.Company.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b007"),
    name: "Tech Corp",
    salesAgents: [],
    products: [],
    inventory: [],
    clients: [],
    productRequests: [],
    profit: 5000.0,
    loss: 1200.0,
    createdAt: new Date("2024-12-01T12:00:00.000Z"),
    updatedAt: new Date("2024-12-15T12:00:00.000Z"),
    users: []
  }
]);

db.Product.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b008"),
    name: "Laptop",
    description: "High-performance laptop",
    category: "Electronics",
    tags: ["tech", "gadgets"],
    price: 1200.0,
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b007"),
    createdAt: new Date("2024-12-01T12:00:00.000Z"),
    updatedAt: new Date("2024-12-15T12:00:00.000Z"),
    productCategoryId: ObjectId("63f7c9e2d91b1b2a5e80b005"),
    orders: [],
    inventoryItems: [],
    requests: [],
    commissions: []
  },
    {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b010"),
    name: "Smartphone",
    description: "Latest model with 5G",
    category: "Electronics",
    tags: ["smartphone", "5G"],
    price: 699.99,
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    createdAt: new Date(),
    updatedAt: new Date(),
    productCategoryId: ObjectId("63f7c9e2d91b1b2a5e80b005"),
    orders: [],
    inventoryItems: [],
    requests: [],
    commissions: []
  }
]);

// Request Collection
db.Request.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b011"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b010"),
    requestedById: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    type: "PRODUCT_REQUEST",
    quantity: 5,
    status: "PENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    salesAgentId: null,
    clientId: null
  },
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b008"),
    requestedById: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    type: "PRODUCT_REQUEST",
    quantity: 5,
    status: "PENDING",
    createdAt: new Date("2024-12-20T12:00:00.000Z"),
    updatedAt: new Date("2024-12-20T12:00:00.000Z"),
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b007")
  }
]);

// Task Collection
db.Task.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b012"),
    taskName: "Submit Report",
    dueDate: new Date("2024-12-25"),
    userId: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    dueTime: "15:00",
    description: "Monthly sales report submission",
    icon: "report_icon.png",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Client Collection
db.Client.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b013"),
    name: "John Doe",
    email: "johndoe@example.com",
    phoneNumber: "123-456-7890",
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    salesAgentId: null,
    orders: [],
    customerRequests: [],
    profit: 1000.0,
    loss: 50.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    communications: []
  }
]);

db.Order.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b201"),
    clientId: ObjectId("63f7c9e2d91b1b2a5e80b300"),
    salesAgentId: ObjectId("63f7c9e2d91b1b2a5e80b400"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b008"),
    status: "PENDING",
    quantity: 2,
    totalPrice: 2400.0,
    commission: 200.0,
    createdAt: new Date("2024-12-20T12:00:00.000Z"),
    updatedAt: new Date("2024-12-20T12:00:00.000Z"),
    commissions: []
  },
    {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b014"),
    clientId: ObjectId("63f7c9e2d91b1b2a5e80b013"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b010"),
    salesAgentId: null,
    status: "PENDING",
    quantity: 2,
    totalPrice: 1399.98,
    commission: 0.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    commissions: []
  }
]);



// Communication Collection
db.Communication.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b015"),
    senderId: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    receiverId: ObjectId("63f7c9e2d91b1b2a5e80b013"),
    subject: "Follow-up on Order",
    message: "Your order will be delivered by next week.",
    createdAt: new Date()
  }
]);



// SalesAgent Collection
db.SalesAgent.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b016"),
    name: "Alice Smith",
    email: "alice.smith@example.com",
    phoneNumber: "987-654-3210",
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    clients: [],
    orders: [],
    productRequests: [],
    role: "Agent",
    commission: 0.0,
    totalSales: 5000.0,
    profit: 500.0,
    loss: 50.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    commissions: [],
    communications: []
  }
]);

db.User.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    name: "John Doe",
    email: "john.doe@example.com",
    password: "hashedpassword",
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b007"),
    role: "Admin",
    createdAt: new Date("2024-12-01T12:00:00.000Z"),
    updatedAt: new Date("2024-12-15T12:00:00.000Z"),
    accounts: [],
    sessions: [],
    tasks: [],
    requests: []
  }
]);

db.InventoryItem.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b200"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b008"),
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b007"),
    quantity: 50,
    damaged: 2,
    reorderThreshold: 10,
    createdAt: new Date("2024-12-01T12:00:00.000Z"),
    updatedAt: new Date("2024-12-15T12:00:00.000Z")
  },
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b017"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b010"),
    companyId: ObjectId("63f7c9e2d91b1b2a5e80b009"),
    quantity: 100,
    damaged: 2,
    reorderThreshold: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    inventoryLogs: [],
    returns: []
  }
]);

// InventoryLog Collection
db.InventoryLog.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b018"),
    inventoryId: ObjectId("63f7c9e2d91b1b2a5e80b017"),
    action: "Added",
    quantity: 50,
    createdAt: new Date()
  }
]);

// Return Collection
db.Return.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b019"),
    inventoryId: ObjectId("63f7c9e2d91b1b2a5e80b017"),
    returnedById: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    quantity: 5,
    status: "PROCESSING",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Commission Collection
db.Commission.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b020"),
    salesAgentId: ObjectId("63f7c9e2d91b1b2a5e80b016"),
    productId: ObjectId("63f7c9e2d91b1b2a5e80b010"),
    orderId: ObjectId("63f7c9e2d91b1b2a5e80b014"),
    commissionRate: 0.1,
    commissionEarned: 139.998,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: "PENDING"
  }
]);

// AuditLog Collection
db.AuditLog.insertMany([
  {
    _id: ObjectId("63f7c9e2d91b1b2a5e80b021"),
    action: "Created Order",
    userId: ObjectId("63f7c9e2d91b1b2a5e80b100"),
    timestamp: new Date(),
    details: "Order #1234 created for client John Doe"
  }
]);

// Add similar entries for all other collections in the schema

// Notification Collection
// ProductCategory Collection













