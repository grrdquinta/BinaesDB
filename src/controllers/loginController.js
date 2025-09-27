import config from "../config.js";
import Client from "../models/Client.js";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const loginController = {};

const maxAttempts = 3;
const lockTime = 15 * 60 * 1000; // 15 minutos

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    // Verificar si es Admin
    if (
      email === config.emailAdmin.email &&
      password === config.emailAdmin.password
    ) {
      userType = "Admin";
      userFound = { _id: "Admin" };
    } else {
      // Verificar si es Cliente
      userFound = await Client.findOne({ email });
      userType = "Client";
    }

    if (!userFound) {
      return res.status(404).json({ 
        success: false, 
        message: "Usuario no encontrado" 
      });
    }

    // Verificar si el usuario está bloqueado (solo para clientes)
    if (userType !== "Admin") {
      if (userFound.lockTime && userFound.lockTime > Date.now()) {
        const minutosRestantes = Math.ceil(
          (userFound.lockTime - Date.now()) / 60000
        );
        return res.status(403).json({
          success: false,
          message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minutos`,
        });
      }
    }

    // Validar contraseña (solo para clientes)
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        // Incrementar intentos fallidos
        userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;
        
        if (userFound.loginAttempts >= maxAttempts) {
          userFound.lockTime = Date.now() + lockTime;
          await userFound.save();
          return res.status(403).json({ 
            success: false, 
            message: "Usuario bloqueado por múltiples intentos fallidos" 
          });
        }
        
        await userFound.save();
        return res.status(401).json({ 
          success: false, 
          message: "Contraseña incorrecta" 
        });
      }

      // Verificar si el email está verificado
      if (!userFound.isVerified) {
        return res.status(401).json({ 
          success: false, 
          message: "Email no verificado. Verifica tu correo antes de iniciar sesión" 
        });
      }

      // Resetear intentos fallidos
      userFound.loginAttempts = 0;
      userFound.lockTime = null;
      await userFound.save();
    }

    // Generar token
    const token = jsonwebtoken.sign(
      { id: userFound._id, userType },
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    res.cookie("authToken", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
    });

    res.status(200).json({ 
      success: true, 
      message: "Login exitoso",
      userType: userType
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor" 
    });
  }
};

export default loginController;