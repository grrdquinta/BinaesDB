import Book from "../models/Book.js";
import { v2 as cloudinary } from 'cloudinary';
import { config } from "../config.js";
import mongoose from 'mongoose';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: config.cloudinary.cloudinary_name,        
    api_key: config.cloudinary.cloudinary_api_key,       
    api_secret: config.cloudinary.cloudinary_api_secret   
});

const booksController = {};

/**
 * Valida si un ID es un ObjectId válido de MongoDB
 */
const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Extrae el public_id de una URL de Cloudinary
 */
const extractPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    return `binaes/books/${publicId}`;
};

// GET /api/books
booksController.getBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .populate('idAuthors', 'firstName lastName')
      .populate('idCategories', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(books);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/books/:id
booksController.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar formato del ID
    if (!validateObjectId(id)) {
        return res.status(400).json({ 
            message: 'Formato de ID inválido' 
        });
    }
    
    const book = await Book.findById(id)
      .populate('idAuthors', 'firstName lastName bio')
      .populate('idCategories', 'name description');
    
    if (!book) {
      return res.status(404).json({ 
        message: "Libro no encontrado" 
      });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/books
booksController.createBook = async (req, res) => {
  try {
    const {
      title,
      summary,
      isbn,
      idAuthors,
      tags,
      publishedDate,
      copiesAvailable,
      idCategories
    } = req.body;

    // Validar campos requeridos
    if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
            message: 'El título del libro es requerido' 
        });
    }

    if (!idAuthors || idAuthors.length === 0) {
        return res.status(400).json({ 
            message: 'El libro debe tener al menos un autor' 
        });
    }

    if (!idCategories || idCategories.length === 0) {
        return res.status(400).json({ 
            message: 'El libro debe tener al menos una categoría' 
        });
    }

    // Verificar si ya existe un libro con el mismo ISBN
    if (isbn && isbn.trim()) {
        const existingBook = await Book.findOne({ isbn: isbn.trim() });
        if (existingBook) {
            return res.status(409).json({ 
                message: 'Ya existe un libro con ese ISBN' 
            });
        }
    }

    let imageUrl = null;

    // Procesar imagen si se proporciona
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'binaes/books',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Error al subir imagen:', uploadError);
            return res.status(400).json({ 
                message: 'Error al procesar la imagen' 
            });
        }
    }

    // Preparar datos del libro
    const bookData = {
      title: title.trim(),
      summary: summary ? summary.trim() : undefined,
      isbn: isbn ? isbn.trim() : undefined,
      idAuthors: Array.isArray(idAuthors) ? idAuthors : [idAuthors],
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
      coverUrl: imageUrl,
      publishedDate: publishedDate || undefined,
      copiesAvailable: copiesAvailable ? parseInt(copiesAvailable) : 1,
      idCategories: Array.isArray(idCategories) ? idCategories : [idCategories]
    };

    const newBook = new Book(bookData);
    const savedBook = await newBook.save();
    
    const populatedBook = await Book.findById(savedBook._id)
      .populate('idAuthors', 'firstName lastName')
      .populate('idCategories', 'name');

    res.status(201).json({
      message: "Libro creado exitosamente",
      book: populatedBook
    });
  } catch (error) {
    console.error('Error al crear libro:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
            message: 'Errores de validación',
            errors: validationErrors
        });
    }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/books/:id
booksController.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      isbn,
      idAuthors,
      tags,
      publishedDate,
      copiesAvailable,
      idCategories
    } = req.body;

    // Validar formato del ID
    if (!validateObjectId(id)) {
        return res.status(400).json({ 
            message: 'Formato de ID inválido' 
        });
    }

    // Buscar el libro existente
    const existingBook = await Book.findById(id);

    if (!existingBook) {
        return res.status(404).json({ 
            message: 'Libro no encontrado' 
        });
    }

    // Preparar datos de actualización
    let updateData = {};

    // Validar y actualizar título si se proporciona
    if (title) {
        if (title.trim().length === 0) {
            return res.status(400).json({ 
                message: 'El título del libro no puede estar vacío' 
            });
        }
        updateData.title = title.trim();
    }

    // Actualizar otros campos si se proporcionan
    if (summary !== undefined) updateData.summary = summary.trim();
    if (publishedDate !== undefined) updateData.publishedDate = publishedDate;
    if (copiesAvailable !== undefined) updateData.copiesAvailable = parseInt(copiesAvailable);

    // Validar y actualizar ISBN si se proporciona
    if (isbn !== undefined) {
        if (isbn.trim() && isbn.trim() !== existingBook.isbn) {
            const duplicateBook = await Book.findOne({ 
                isbn: isbn.trim(),
                _id: { $ne: id }
            });

            if (duplicateBook) {
                return res.status(409).json({ 
                    message: 'Ya existe un libro con ese ISBN' 
                });
            }
        }
        updateData.isbn = isbn.trim() || undefined;
    }

    // Actualizar arrays si se proporcionan
    if (idAuthors) {
        updateData.idAuthors = Array.isArray(idAuthors) ? idAuthors : [idAuthors];
    }

    if (idCategories) {
        updateData.idCategories = Array.isArray(idCategories) ? idCategories : [idCategories];
    }

    if (tags !== undefined) {
        updateData.tags = tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [];
    }

    // Procesar nueva imagen si se proporciona
    if (req.file) {
        try {
            // Eliminar imagen anterior si existe
            if (existingBook.coverUrl) {
                const publicId = extractPublicIdFromUrl(existingBook.coverUrl);
                await cloudinary.uploader.destroy(publicId);
            }

            // Subir nueva imagen
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'binaes/books',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });
            updateData.coverUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Error al actualizar imagen:', uploadError);
            return res.status(400).json({ 
                message: 'Error al procesar la imagen' 
            });
        }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('idAuthors', 'firstName lastName')
    .populate('idCategories', 'name');

    res.status(200).json({
      message: "Libro actualizado exitosamente",
      book: updatedBook
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
            message: 'Errores de validación',
            errors: validationErrors
        });
    }

    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/books/:id
booksController.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar formato del ID
    if (!validateObjectId(id)) {
        return res.status(400).json({ 
            message: 'Formato de ID inválido' 
        });
    }

    // Buscar el libro
    const book = await Book.findById(id);

    if (!book) {
        return res.status(404).json({ 
            message: 'Libro no encontrado' 
        });
    }

    // Eliminar imagen de Cloudinary si existe
    if (book.coverUrl) {
        try {
            const publicId = extractPublicIdFromUrl(book.coverUrl);
            await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
            console.error('Error al eliminar imagen de Cloudinary:', cloudinaryError);
            // Continuar con la eliminación aunque falle la imagen
        }
    }

    // Eliminar de la base de datos
    await Book.findByIdAndDelete(id);

    res.status(200).json({ 
        message: 'Libro eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default booksController;