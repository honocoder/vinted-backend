// Appel d'Express et initialisation des Routers
const express = require("express");
const formidable = require("express-formidable");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;

// Import des Models
const User = require("../models/User");
const Offer = require("../models/Offer");

// Route 1 : Signup
router.post("/user/signup", async (req, res) => {
  try {
    // Vérifier que l'email reçu n'exite pas déjà dans la db
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      // Password
      // Générer SALT
      const salt = uid2(16);
      // console.log("salt ==>", salt);

      // Générer un HASH
      const hash = SHA256(req.fields.password + salt).toString(encBase64);
      // console.log("hash ==>", hash);

      // Générer un TOKEN
      const token = uid2(64);
      // console.log("token ==>", token);

      // Créer un nouveau User
      const newUser = new User({
        email: req.fields.email,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
        token: token,
        hash: hash,
        salt: salt,
      });
      // Sauvegarde du nouveau User dans la db
      await newUser.save();

      // Réponse au client
      res.status(200).json({
        _id: newUser._id,
        token: token,
        account: {
          username: req.fields.username,
          phone: req.fields.phone,
        },
      });
    } else {
      res.status(409).json({ message: "This email already has an account" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route 2 : Login
router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.fields.email });
    const password = req.fields.password;
    const newHash = SHA256(password + user.salt).toString(encBase64);

    if (newHash === user.hash) {
      res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      res.status(400).json({ message: "Wrong login or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export des Routers
module.exports = router;
