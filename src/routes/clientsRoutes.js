import express from "express";
import clientsController from "../controllers/clientsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const clientsRoutes = express.Router();

// Todas las rutas requieren autenticación y ser admin
clientsRoutes.use(authMiddleware, adminMiddleware);

clientsRoutes.get("/", clientsController.getClients);
clientsRoutes.get("/:id", clientsController.getClientById);
clientsRoutes.put("/:id", clientsController.updateClient);
clientsRoutes.delete("/:id", clientsController.deleteClient);

export default clientsRoutes;