# Flourisense Cafe Backend

A Node.js backend application for Flourisense Cafe management system, built with Express.js and Sequelize ORM.

## Features

- User and Admin authentication with JWT tokens
- Secure password hashing with bcrypt
- SQLite database with Sequelize ORM
- Input validation with Joi
- CORS support
- Compression middleware
- Docker containerization support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Password Hashing**: bcrypt
- **Containerization**: Docker

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sumeetbalwade/flourisense-cafe-backend.git
cd flourisense-cafe-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=sqlite://./database.sqlite
```

4. Run database migrations (if any):
```bash
# Note: Add migration scripts as needed
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3001 by default (configurable via PORT environment variable).

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### User Routes
- `POST /api/v1/user/auth/register` - Register a new user

### Admin Routes
- `POST /api/v1/admin/auth/register` - Register a new admin

## Project Structure

```
flourisense-cafe-backend/
├── index.js                 # Application entry point
├── router.js               # Main router configuration
├── package.json            # Dependencies and scripts
├── Dockerfile              # Docker configuration
├── config/
│   ├── config.js          # Application configuration
│   └── dbConfig.js        # Database configuration
├── helpers/               # Utility functions
├── middleware/
│   └── JWT.middleware.js  # JWT authentication middleware
├── models/                # Database models
├── admin/                 # Admin module
│   ├── controllers/
│   ├── routes/
│   └── validators/
├── users/                 # User module
│   ├── controllers/
│   ├── routes/
│   └── validators/
└── utils/                 # Utility functions
```

## Docker Support

### Build the Docker image:
```bash
docker build -t flourisense-cafe-backend .
```

### Run the container:
```bash
docker run -p 3001:3001 flourisense-cafe-backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `JWT_SECRET` | JWT signing secret | Required |
| `DATABASE_URL` | Database connection URL | sqlite://./database.sqlite |

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (currently not implemented)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

**Sumeet Balwade**

---

For more information or support, please contact the development team.</content>
<parameter name="filePath">/Users/sumeetbalwade/Documents/Project/flourisense-cafe-backend/README.md