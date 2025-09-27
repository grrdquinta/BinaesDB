import booksController from '../controllers/booksController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import express from 'express';
import multer from 'multer';

const upload = multer({ dest: 'books/' });

const booksRoutes = express.Router();

// Rutas públicas (solo lectura)
booksRoutes.get("/", booksController.getBooks);
booksRoutes.get("/:id", booksController.getBookById);

// Rutas protegidas para admin con upload
booksRoutes.route('/')
    .post(authMiddleware, adminMiddleware, upload.single('cover'), booksController.createBook);

booksRoutes.route('/:id')
    .put(authMiddleware, adminMiddleware, upload.single('cover'), booksController.updateBook)
    .delete(authMiddleware, adminMiddleware, booksController.deleteBook);

export default booksRoutes;