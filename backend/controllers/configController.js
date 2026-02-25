import SystemConfig from "../models/SystemConfig.js";
import catchAsync from "../utils/catchAsync.js";

// GET settings (If none exist, create default)
export const getConfig = catchAsync(async (req, res) => {
  let config = await SystemConfig.findOne();
  if (!config) {
    config = await SystemConfig.create({}); // Create default if empty
  }
  res.json(config);
});

// UPDATE settings (Admin only)
export const updateConfig = catchAsync(async (req, res) => {
  // Upsert: Update if exists, Create if not
  const config = await SystemConfig.findOneAndUpdate({}, req.body, { 
    new: true, 
    upsert: true 
  });
  res.json({ 
    success: true, 
    message: "Configuration saved successfully",
    data: config 
  });
});
