import Loan from "../models/Loan.js";

const loansController = {};

// GET /api/loans
loansController.getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('idClient', 'name email')
      .populate('idBook', 'title isbn copiesAvailable')
      .sort({ loanDate: -1 });
    
    res.status(200).json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Error obteniendo préstamos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// GET /api/loans/:id
loansController.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const loan = await Loan.findById(id)
      .populate('idClient', 'name email')
      .populate('idBook', 'title isbn author');
    
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: "Préstamo no encontrado" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: loan
    });
  } catch (error) {
    console.error('Error obteniendo préstamo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// POST /api/loans
loansController.createLoan = async (req, res) => {
  try {
    const { idClient, idBook, dueDate, notes } = req.body;

    // Verificar que el libro esté disponible
    const book = await Book.findById(idBook);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Libro no encontrado"
      });
    }

    if (book.copiesAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: "No hay copias disponibles de este libro"
      });
    }

    // Verificar que el cliente no tenga préstamos vencidos
    const overdueLoans = await Loan.find({
      idClient,
      status: 'overdue'
    });

    if (overdueLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El cliente tiene préstamos vencidos. No puede realizar nuevos préstamos."
      });
    }

    // Crear el préstamo
    const newLoan = new Loan({
      idClient,
      idBook,
      dueDate,
      notes
    });

    await newLoan.save();

    // Decrementar copias disponibles del libro
    book.copiesAvailable -= 1;
    await book.save();

    const populatedLoan = await Loan.findById(newLoan._id)
      .populate('idClient', 'name email')
      .populate('idBook', 'title isbn');

    res.status(201).json({
      success: true,
      message: "Préstamo creado exitosamente",
      data: populatedLoan
    });
  } catch (error) {
    console.error('Error creando préstamo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// PUT /api/loans/:id
loansController.updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, returnDate, notes } = req.body;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: "Préstamo no encontrado" 
      });
    }

    // Si se está marcando como devuelto, incrementar copias disponibles
    if (status === 'returned' && loan.status !== 'returned') {
      const book = await Book.findById(loan.idBook);
      if (book) {
        book.copiesAvailable += 1;
        await book.save();
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      id,
      { 
        status,
        returnDate: status === 'returned' ? (returnDate || new Date()) : returnDate,
        notes
      },
      { new: true, runValidators: true }
    )
    .populate('idClient', 'name email')
    .populate('idBook', 'title isbn');

    res.status(200).json({
      success: true,
      message: "Préstamo actualizado exitosamente",
      data: updatedLoan
    });
  } catch (error) {
    console.error('Error actualizando préstamo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// DELETE /api/loans/:id
loansController.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ 
        success: false, 
        message: "Préstamo no encontrado" 
      });
    }

    // Si el préstamo estaba activo, devolver copia al libro
    if (loan.status === 'active') {
      const book = await Book.findById(loan.idBook);
      if (book) {
        book.copiesAvailable += 1;
        await book.save();
      }
    }

    await Loan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Préstamo eliminado exitosamente"
    });
  } catch (error) {
    console.error('Error eliminando préstamo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

export default loansController;