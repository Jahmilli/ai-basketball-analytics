import Joi from "@hapi/joi";

export const InSchema = Joi.object({
  name: Joi.string().required(),
  timestamp: Joi.number().required(),
});
