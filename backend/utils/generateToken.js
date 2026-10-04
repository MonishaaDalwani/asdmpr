import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_development_only';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d',
  });
};

export default generateToken;
