const VirusGuard = require("../models/virusGuardModel");

// CREATE
exports.createVirusGuard = async (req, res) => {
  try {
    const virusGuard = await VirusGuard.create(req.body);

    res.status(201).json({
      success: true,
      data: virusGuard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
exports.getAllVirusGuards = async (req, res) => {
  try {
    const virusGuards = await VirusGuard.find();

    res.json({
      success: true,
      count: virusGuards.length,
      data: virusGuards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE
exports.getVirusGuard = async (req, res) => {
  try {
    const virusGuard = await VirusGuard.findById(req.params.id);

    if (!virusGuard) {
      return res.status(404).json({
        message: "Virus Guard not found",
      });
    }

    res.json({
      success: true,
      data: virusGuard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
exports.updateVirusGuard = async (req, res) => {
  try {
    const virusGuard = await VirusGuard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!virusGuard) {
      return res.status(404).json({
        message: "Virus Guard not found",
      });
    }

    res.json({
      success: true,
      data: virusGuard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
exports.deleteVirusGuard = async (req, res) => {
  try {
    const virusGuard = await VirusGuard.findByIdAndDelete(req.params.id);

    if (!virusGuard) {
      return res.status(404).json({
        message: "Virus Guard not found",
      });
    }

    res.json({
      success: true,
      message: "Virus Guard deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
