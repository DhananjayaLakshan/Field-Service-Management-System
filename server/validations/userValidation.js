const Joi = require("joi");

const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).trim().optional(),

  email: Joi.string().email().trim().optional(),

  password: Joi.string().min(6).optional().allow(""),

  role: Joi.string().valid("Admin", "Manager", "Employee").optional(),
})
  .min(1) // At least one field must be provided
  .messages({
    "object.min": "At least one field must be provided for update",
  });

module.exports = {
  updateUserSchema,
};
