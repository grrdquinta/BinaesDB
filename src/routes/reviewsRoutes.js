import express from "express";
import reviewsController from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const reviewsRoutes = express.Router();

// Rutas públicas
reviewsRoutes.get("/", reviewsController.getReviews);
reviewsRoutes.get("/:id", reviewsController.getReviewById);

// Rutas que requieren autenticación
reviewsRoutes.post("/", authMiddleware, reviewsController.createReview);
reviewsRoutes.put("/:id", authMiddleware, reviewsController.updateReview);
reviewsRoutes.delete("/:id", authMiddleware, reviewsController.deleteReview);

export default reviewsRoutes;