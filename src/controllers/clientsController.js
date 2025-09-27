import Client from "../models/Client.js";

const clientsController = {};

// GET /api/clients - Solo Admin
clientsController.getClients = async (req, res) => {
  try {
    const clients = await Client.find().select('-password');
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// GET /api/clients/:id - Solo Admin
clientsController.getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findById(id).select('-password');
    
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente no encontrado" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// PUT /api/clients/:id - Solo Admin
clientsController.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isVerified } = req.body;

    // Si se está cambiando el email, verificar que no exista
    if (email) {
      const existingClient = await Client.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un cliente con ese email"
        });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { name, email, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedClient) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente actualizado exitosamente",
      data: updatedClient
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

// DELETE /api/clients/:id - Solo Admin
clientsController.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClient = await Client.findByIdAndDelete(id);
    
    if (!deletedClient) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente eliminado exitosamente"
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
};

export default clientsController;