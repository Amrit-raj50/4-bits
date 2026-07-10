export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    status: 'fail',
    message,
    statusCode,
    errors,
  });
};
