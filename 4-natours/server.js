const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, ':', err.message);
  process.exit(1);
});

dotenv.config({ path: './4-natours/config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB connection successful 🍃');
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDELED REJECTION! 💥 Shutting down...');
  console.log(err.name, ':', err.message);
  server.close(() => {
    process.exit(1);
  });
});
