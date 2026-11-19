const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerRules = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name too short'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('ward').optional().isString(),
  validate,
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];

module.exports = { registerRules, loginRules };