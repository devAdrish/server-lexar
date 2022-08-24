const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGODB_URI;
exports.connect = () => {
  console.log('Connecting to DB ....')
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to DB!");
    })
    .catch((error) => {
      console.log("DB connection failed ;(");
      console.error(error);
      process.exit(1);
    });
};