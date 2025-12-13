
export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).render("error", 
        {
      errorMessage: "Login required",
      class: "login-fail"
    });
  }
  next();
}
