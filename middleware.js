export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

export function requireLogout(req, res, next) {
  if (req.session.user) {
    return res.redirect('/myaccount');
  }
  next();
}

