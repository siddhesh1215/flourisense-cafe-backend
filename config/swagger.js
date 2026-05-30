const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flourisense Café API',
      version: '1.0.0',
      description:
        'REST API for the Flourisense Café backend — covers user auth, menu, cart, orders, feedback, location (public) and all admin management routes.',
      contact: { name: 'Sumeet Balwade' },
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without the "Bearer " prefix)',
        },
      },
      schemas: {
        // ── Generic wrappers ──────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string' },
            data: { nullable: true, example: null },
          },
        },
        // ── Domain schemas ────────────────────────────────────────────────
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', example: 'user' },
            inactive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'number', format: 'float' },
            category_id: { type: 'integer' },
            is_available: { type: 'boolean' },
            is_popular: { type: 'boolean' },
            display_order: { type: 'integer' },
            inactive: { type: 'boolean' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            menu_item_id: { type: 'integer' },
            quantity: { type: 'integer' },
            user_id: { type: 'integer' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            payment_method: { type: 'string', example: 'cash' },
            location_id: { type: 'integer', nullable: true },
            status_id: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Feedback: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            message: { type: 'string', nullable: true },
            location_id: { type: 'integer', nullable: true },
            order_id: { type: 'integer', nullable: true },
            status: { type: 'string', example: 'active' },
          },
        },
        Location: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string', nullable: true },
            city: { type: 'string', nullable: true },
            inactive: { type: 'boolean' },
          },
        },
        AdminUser: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', example: 'admin' },
            inactive: { type: 'boolean' },
            first_login: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'User — Auth',      description: 'User registration, login, OTP, profile' },
      { name: 'User — Menu',      description: 'Public menu browsing' },
      { name: 'User — Cart',      description: 'Cart management (auth required)' },
      { name: 'User — Orders',    description: 'Place & manage orders (auth required)' },
      { name: 'User — Feedback',  description: 'Submit and view feedback' },
      { name: 'User — Location',  description: 'Browse active locations (public)' },
      { name: 'Admin — Auth',     description: 'Admin login and OTP verification' },
      { name: 'Admin — Menu',     description: 'Admin menu item CRUD' },
      { name: 'Admin — Orders',   description: 'Admin order management' },
      { name: 'Admin — Feedback', description: 'Admin feedback moderation' },
      { name: 'Admin — Location', description: 'Admin location management' },
      { name: 'Admin — Analytics',description: 'Revenue, order, and traffic analytics' },
      { name: 'Super Admin',      description: 'Admin & user account management (super_admin only)' },
    ],
  },
  // Scan all route files for @swagger JSDoc comments
  apis: [
    './admin/routes/*.js',
    './users/routes/*.js',
  ],
};

module.exports = swaggerJsdoc(options);
