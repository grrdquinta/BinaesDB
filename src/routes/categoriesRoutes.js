import express from "express";
import categoriesController from "../controllers/categoriesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const categoriesRoutes = express.Router();

// Rutas públicas
categoriesRoutes.get("/", categoriesController.getCategories);
categoriesRoutes.get("/:id", categoriesController.getCategoryById);

// Rutas protegidas para admin
categoriesRoutes.post("/", authMiddleware, adminMiddleware, categoriesController.createCategory);
categoriesRoutes.put("/:id", authMiddleware, adminMiddleware, categoriesController.updateCategory);
categoriesRoutes.delete("/:id", authMiddleware, adminMiddleware, categoriesController.deleteCategory);

export default categoriesRoutes;