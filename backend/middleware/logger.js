import morgan from 'morgan';

// Request logging middleware
export const requestLogger = morgan((tokens, req, res) => {
  return [
    new Date().toISOString(),
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    '- User:', req.user ? req.user._id : 'Guest'
  ].join(' ');
});

// Custom logger for development
export const devLogger = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};
