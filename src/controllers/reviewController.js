import Review from "../models/Review.js";

const reviewsController = {};

// GET /api/reviews
reviewsController.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('idClient', 'name')
      .populate('idBook', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// GET /api/reviews/:id
reviewsController.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id)
      .populate('idClient', 'name')
      .populate('idBook', 'title');
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Reseña no encontrada" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error obteniendo reseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// POST /api/reviews
reviewsController.createReview = async (req, res) => {
  try {
    const { idBook, rating, comment } = req.body;
    const idClient = req.user.id; 

    // Verificar que el cliente no haya reseñado ya este libro
    const existingReview = await Review.findOne({ idClient, idBook });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Ya has reseñado este libro"
      });
    }

    // Verificar que el libro existe
    const book = await Book.findById(idBook);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado"
      });
    }

    const newReview = new Review({
      idClient,
      idBook,
      rating,
      comment
    });

    await newReview.save();

    const populatedReview = await Review.findById(newReview._id)
      .populate('idClient', 'name')
      .populate('idBook', 'title');

    res.status(201).json({
      success: true,
      message: "Reseña creada exitosamente",
      data: populatedReview
    });
  } catch (error) {
    console.error('Error creando reseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// PUT /api/reviews/:id
reviewsController.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Reseña no encontrada" 
      });
    }

    // Verificar que el usuario sea el dueño de la reseña o admin
    if (review.idClient.toString() !== userId && req.user.userType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para editar esta reseña"
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true, runValidators: true }
    )
    .populate('idClient', 'name')
    .populate('idBook', 'title');

    res.status(200).json({
      success: true,
      message: "Reseña actualizada exitosamente",
      data: updatedReview
    });
  } catch (error) {
    console.error('Error actualizando reseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// DELETE /api/reviews/:id
reviewsController.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Reseña no encontrada" 
      });
    }

    // Verificar que el usuario sea el dueño de la reseña o admin
    if (review.idClient.toString() !== userId && req.user.userType !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar esta reseña"
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Reseña eliminada exitosamente"
    });
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

export default reviewsController;