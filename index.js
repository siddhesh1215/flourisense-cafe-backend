const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const sequelize = require('./config/dbConfig.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const routes = require('./router.js');
app.use('/api/v1', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});