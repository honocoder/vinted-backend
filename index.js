// Import d'ExpressJS, Formidable et Mongoose
const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("./middlewares/isAuthenticated");
const cors = require("cors");

require("dotenv").config();
// Initialisation du serveur
const app = express();
app.use(formidable());
app.use(cors());

// Initialisation de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Connexion à la db
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Import des routes
const userRoutes = require("./routes/users");
const offerRoutes = require("./routes/offers");
const paymentRoute = require("./routes/payment");
app.use(userRoutes);
app.use(offerRoutes);
aoo.use(paymentRoute);

// Gestion des routes inexistantes
app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

// Écoute d'un port (3000)
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
