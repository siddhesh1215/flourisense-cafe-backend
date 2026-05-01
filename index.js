const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { sequelize } = require('./models');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const routes = require('./router.js');
app.use('/api/v1', routes);

// Sync database and start server
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced successfully');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
    process.exit(1);
  });