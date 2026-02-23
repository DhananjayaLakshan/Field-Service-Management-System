const Joi = require("joi");

const createVisitSchema = Joi.object({
  companyId: Joi.string().hex().length(24).required(),
  visitedAt: Joi.date().optional(),
  arrivalTime: Joi.date().required(),
  notes: Joi.string().allow("").max(2000).optional(),
  signatureUrl: Joi.string().uri().required(), // required to submit
});

const updateVisitSchema = Joi.object({
  visitedAt: Joi.date().optional(),
  visitedAt: Joi.date().optional(),
  notes: Joi.string().allow("").max(2000).optional(),
  signatureUrl: Joi.string().uri().optional(),
}).min(1);

module.exports = {
  createVisitSchema,
  updateVisitSchema,
};
