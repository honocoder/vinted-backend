// Appel d'Express et initialisation des routers
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require("../middlewares/isAuthenticated");
const router = express.Router();

// Import des Models
const Offer = require("../models/Offer");
const User = require("../models/User");

// Route Publish
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  app.use(cors());
  try {
    // Création d'une nouvelle Offer
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ÉTAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      owner: req.user,
    });

    // Upload de l'image sur Cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `vinted/offers/${newOffer.id}`,
    });

    // Ajouter le résultat de l'upload dans newOffer
    newOffer.product_image = result;

    // Sauvegarde de l'Offer dans la db
    await newOffer.save();

    // Réponse au client
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    // Créer un objet vide pour les filtres
    const filters = {};
    let sort = {};
    // Remplir l'objet avec des paires clés/valeurs (grâce à des conditions)
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i"); // ajoute une clé product_name à l'objet filters qui a pour valeur req.query.title(+RegExp)
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) };
      }
    }

    if (req.query.sort === "price-asc") {
      sort = { product_price: 1 };
    } else if (req.query.sort === "price-desc") {
      sort = { product_price: -1 };
    }

    // let page;
    const limit = Number(req.query.limit);

    if (Number(req.query.page < 1)) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    const offers = await Offer.find(filters)
      .populate({ path: "owner", select: "account" })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      offers: offers,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
