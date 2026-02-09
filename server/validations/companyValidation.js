const Joi = require("joi");

/**
 * CREATE company validation
 */
const createCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  address: Joi.string().trim().min(5).max(255).required(),

  addressLink: Joi.string().uri().optional().allow(""),

  contactPerson: Joi.string().trim().min(2).max(100).required(),

  contactNumber: Joi.string()
    .pattern(/^[0-9+\-()\s]{7,20}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid contact number format",
    }),

  assignedUser: Joi.string().hex().length(24).optional(),
});

/**
 * UPDATE company validation
 * (all fields optional, at least one required)
 */
const updateCompanySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),

  address: Joi.string().trim().min(5).max(255).optional(),

  addressLink: Joi.string().uri().optional().allow(""),

  contactPerson: Joi.string().trim().min(2).max(100).optional(),

  contactNumber: Joi.string()
    .pattern(/^[0-9+\-()\s]{7,20}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid contact number format",
    }),

  assignedUser: Joi.string().hex().length(24).optional(),
}).min(1); // 🔥 ensures at least one field is sent

module.exports = {
  createCompanySchema,
  updateCompanySchema,
};
