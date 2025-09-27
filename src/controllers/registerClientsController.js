import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Client from "../models/Client.js";
import { config } from "../config.js";

const registerClientsController = {};

registerClientsController.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Verificar si el cliente ya existe
    const existsClient = await Client.findOne({ email });
    if (existsClient) {
      return res.status(400).json({ 
        success: false, 
        message: "El cliente ya existe" 
      });
    }

    // Encriptar la contraseña
    const passwordHash = await bcryptjs.hash(password, 10);

    // Guardar el cliente en la base de datos
    const newClient = new Client({
      name,
      email,
      password: passwordHash,
      isVerified: false,
    });
    await newClient.save();

    // Generar código aleatorio de verificación
    const verificationCode = crypto.randomBytes(3).toString("hex");

    // Crear el Token
    const tokenCode = jsonwebtoken.sign(
      { email, verificationCode },
      config.JWT.secret,
      { expiresIn: "2h" }
    );

    res.cookie("VerificationToken", tokenCode, { maxAge: 2 * 60 * 60 * 1000 });

    // Enviar correo electrónico
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.email.email_user,
        pass: config.email.email_pass,
      },
    });

    const mailOptions = {
      from: config.email.email_user,
      to: email,
      subject: "Verificación de correo - BINAES",
      text: `Para verificar tu correo en BINAES, utiliza el siguiente código: ${verificationCode}\nEl código vence en dos horas`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error enviando correo:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Error enviando correo de verificación" 
        });
      }
      console.log("Correo enviado:", info.response);
    });

    res.status(201).json({
      success: true,
      message: "Cliente registrado. Por favor verifica tu email con el código enviado",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor" 
    });
  }
};

// Verificar el código
registerClientsController.verifyCodeEmail = async (req, res) => {
  const { verificationCode } = req.body;
  const token = req.cookies.VerificationToken;

  try {
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Token de verificación no encontrado" 
      });
    }

    // Verificar y decodificar el token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const { email, verificationCode: storedCode } = decoded;

    // Comparar códigos
    if (verificationCode !== storedCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Código inválido" 
      });
    }

    // Cambiar el estado de isVerified a true
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ 
        success: false, 
        message: "Cliente no encontrado" 
      });
    }

    client.isVerified = true;
    await client.save();

    res.clearCookie("VerificationToken");
    
    res.status(200).json({ 
      success: true, 
      message: "Email verificado exitosamente" 
    });
  } catch (error) {
    console.error("Error verificando código:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error verificando código" 
    });
  }
};

export default registerClientsController;