import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/responseFormatter.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return errorResponse(res, 'Validation failed', 422, extractedErrors);
};

export default validate;
