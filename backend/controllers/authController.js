export const register = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Register not implemented yet.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    res.status(501).json({
      success: false,
      message: "Login not implemented yet.",
    });
  } catch (error) {
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
    res.status(501).json({
      success: false,
      message: "Get me not implemented yet.",
    });
  } catch (error) {
    next(error);
  }
};
