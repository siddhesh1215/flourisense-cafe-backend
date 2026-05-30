require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { sequelize } = require('./models');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ───────────────────────────────────────────────────────────────
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Flourisense Café API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);
// Raw OpenAPI JSON (useful for import into Postman / Insomnia)
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
// ─────────────────────────────────────────────────────────────────────────────

// Import routes
const routes = require('./router.js');
app.use('/api/v1', routes);

// Sync database and start server
sequelize.sync({ alter: false })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Docs available at http://localhost:${port}/api/docs`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
    process.exit(1);
  });