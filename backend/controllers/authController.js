import { registerUser, authenticateUser, generateToken } from "../services/authService.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, role, name, targetRole, company } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await registerUser({ email, password, role, name, targetRole, company });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        targetRole: user.targetRole,
        company: user.company,
      },
    });
  } catch (error) {
    if (error.message === "User already exists") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await authenticateUser(email, password);

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized role access. You are registered as an ${user.role}, not an ${role}.`,
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        targetRole: user.targetRole,
        company: user.company,
      },
    });
  } catch (error) {
    if (error.message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Google login not implemented yet.",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Logout not implemented yet.",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
