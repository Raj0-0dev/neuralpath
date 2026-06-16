import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const UPLOAD_DIR = "uploads/resumes";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique name: originalName (sanitized) - timestamp
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept PDFs only
const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
  const mimetype = file.mimetype === "application/pdf";

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// Configure multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

// Wrapper to handle Multer errors and file checks
export const uploadResumeMiddleware = (req, res, next) => {
  const uploadSingle = upload.single("resume");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error (e.g. file size exceeded)
      return res.status(400).json({
        success: false,
        message: `File upload limit exceeded: ${err.message}`,
      });
    } else if (err) {
      // Custom error (e.g. not a PDF)
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Check if file is present
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Please upload a PDF file using the 'resume' field.",
      });
    }

    // Securely verify that the file starts with PDF signature bytes (%PDF)
    try {
      const fd = fs.openSync(req.file.path, "r");
      const buffer = Buffer.alloc(4);
      fs.readSync(fd, buffer, 0, 4, 0);
      fs.closeSync(fd);

      if (buffer.toString() !== "%PDF") {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: "Validation error: The uploaded file is not a valid PDF document.",
        });
      }
    } catch (fsErr) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        success: false,
        message: "Server error occurred during file security validation.",
      });
    }

    next();
  });
};
