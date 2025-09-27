import express from "express";
import authorsController from "../controllers/authorsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const authorsRoutes = express.Router();

// Rutas públicas
authorsRoutes.get("/", authorsController.getAuthors);
authorsRoutes.get("/:id", authorsController.getAuthorById);

// Rutas protegidas para admin
authorsRoutes.post("/", authMiddleware, adminMiddleware, authorsController.createAuthor);
authorsRoutes.put("/:id", authMiddleware, adminMiddleware, authorsController.updateAuthor);
authorsRoutes.delete("/:id", authMiddleware, adminMiddleware, authorsController.deleteAuthor);

export default authorsRoutes;