const mongoose = require("mongoose");

const MONGO_URI = `mongodb+srv://adrish:letmepass567@cluster0.gtdnu0r.mongodb.net/?authSource=admin&retryWrites=true&w=majority&ssl=true`

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