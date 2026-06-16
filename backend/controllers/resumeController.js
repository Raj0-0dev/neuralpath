export const uploadResume = async (req, res, next) => {
  try {
    const file = req.file;

    // This is the controller skeleton. In a real-world scenario, you would
    // save the resume metadata to the database, link it to the authenticated user,
    // or trigger an AI processing pipeline.
    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
