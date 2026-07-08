import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'vm-techstore-dev-secret';

export function signUser(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    jwtSecret,
    { expiresIn: '8h' }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Debe iniciar sesion' });

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Sesion invalida o expirada' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Debe iniciar sesion' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta accion' });
    }
    return next();
  };
}
