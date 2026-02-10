const Joi = require("joi");

const updatePaymentSchema = Joi.object({
  fromLocation: Joi.string().trim().max(255).optional(),
  cost: Joi.number().min(0).optional(),
}).min(1);

module.exports = {
  updatePaymentSchema,
};
