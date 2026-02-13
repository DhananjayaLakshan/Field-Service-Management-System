const cloudinary = require("cloudinary").v2;
const ApiError = require("../utils/ApiError");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadSignature = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return next(new ApiError(400, "Image is required"));
    }

    const result = await cloudinary.uploader.upload(image, {
      upload_preset: process.env.UPLOAD_PRESET,
      folder: "signatures",
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (err) {
    console.error("🔥 CLOUDINARY ERROR:", err);
    next(new ApiError(500, err.message || "Upload failed"));
  }
};
