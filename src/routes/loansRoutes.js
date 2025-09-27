import express from "express";
import loansController from "../controllers/loansController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const loansRoutes = express.Router();

// Todas las rutas de préstamos requieren autenticación
loansRoutes.use(authMiddleware);

// Rutas que requieren ser admin
loansRoutes.get("/", adminMiddleware, loansController.getLoans);
loansRoutes.get("/:id", adminMiddleware, loansController.getLoanById);
loansRoutes.post("/", adminMiddleware, loansController.createLoan);
loansRoutes.put("/:id", adminMiddleware, loansController.updateLoan);
loansRoutes.delete("/:id", adminMiddleware, loansController.deleteLoan);

export default loansRoutes;