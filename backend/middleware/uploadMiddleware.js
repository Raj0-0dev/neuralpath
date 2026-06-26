import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
  const mimetype = file.mimetype === "application/pdf";

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export const uploadResumeMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("resume");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload limit exceeded: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Please upload a PDF file using the 'resume' field.",
      });
    }

    try {
      const fileHeader = req.file.buffer.toString("utf8", 0, 4);
      if (fileHeader !== "%PDF") {
        return res.status(400).json({
          success: false,
          message: "Validation error: The uploaded file is not a valid PDF document.",
        });
      }
    } catch (validationErr) {
      return res.status(500).json({
        success: false,
        message: "Server error occurred during file security validation.",
      });
    }

    next();
  });
};
