const Joi = require("joi");

const exotelWebhookSchema = Joi.object({
  CallSid: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "CallSid is required.",
      "any.required": "CallSid is required."
    }),

  CallStatus: Joi.string()
    .valid("pending", "ringing", "in-progress", "completed", "failed", "notpickup")
    .required()
    .messages({
      "any.only": "Invalid CallStatus value.",
      "any.required": "CallStatus is required."
    })
});

module.exports={exotelWebhookSchema}