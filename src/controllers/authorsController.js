import Author from "../models/Author.js";

const authorsController = {};

// GET /api/authors
authorsController.getAuthors = async (req, res) => {
  try {
    const authors = await Author.find();
    res.status(200).json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error('Error obteniendo autores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// GET /api/authors/:id
authorsController.getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const author = await Author.findById(id);
    
    if (!author) {
      return res.status(404).json({ 
        success: false, 
        message: "Autor no encontrado" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: author
    });
  } catch (error) {
    console.error('Error obteniendo autor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// POST /api/authors
authorsController.createAuthor = async (req, res) => {
  try {
    const { firstName, lastName, bio, birthDate } = req.body;

    const newAuthor = new Author({
      firstName,
      lastName,
      bio,
      birthDate
    });

    await newAuthor.save();

    res.status(201).json({
      success: true,
      message: "Autor creado exitosamente",
      data: newAuthor
    });
  } catch (error) {
    console.error('Error creando autor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// PUT /api/authors/:id
authorsController.updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, bio, birthDate } = req.body;

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      { firstName, lastName, bio, birthDate },
      { new: true, runValidators: true }
    );

    if (!updatedAuthor) {
      return res.status(404).json({ 
        success: false, 
        message: "Autor no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Autor actualizado exitosamente",
      data: updatedAuthor
    });
  } catch (error) {
    console.error('Error actualizando autor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// DELETE /api/authors/:id
authorsController.deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAuthor = await Author.findByIdAndDelete(id);
    
    if (!deletedAuthor) {
      return res.status(404).json({ 
        success: false, 
        message: "Autor no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Autor eliminado exitosamente"
    });
  } catch (error) {
    console.error('Error eliminando autor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

export default authorsController;