module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'database_name'
  },
  JWT_AUTH_TOKEN: process.env.JWT_AUTH_TOKEN,
  ADMIN_REGISTER_SECRET_KEY: process.env.ADMIN_REGISTER_SECRET_KEY,
  mail: {
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
  },
};