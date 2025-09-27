import Category from "../models/Category.js";

const categoriesController = {};

// GET /api/categories
categoriesController.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// GET /api/categories/:id
categoriesController.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Categoría no encontrada" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// POST /api/categories
categoriesController.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Verificar si ya existe una categoría con ese nombre
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una categoría con ese nombre"
      });
    }

    const newCategory = new Category({
      name,
      description
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: newCategory
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// PUT /api/categories/:id
categoriesController.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Verificar si ya existe otra categoría con ese nombre
    if (name) {
      const existingCategory = await Category.findOne({ 
        name, 
        _id: { $ne: id } 
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Ya existe una categoría con ese nombre"
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ 
        success: false, 
        message: "Categoría no encontrada" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Categoría actualizada exitosamente",
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// DELETE /api/categories/:id
categoriesController.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return res.status(404).json({ 
        success: false, 
        message: "Categoría no encontrada" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Categoría eliminada exitosamente"
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

export default categoriesController;