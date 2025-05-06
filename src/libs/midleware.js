const midleware = (req, res, next) => {
  console.log("token valido en espera ", req.session);
  if (!req.session?.usuario) {
    return res.json({ response: false, mensaje: "token invalido" });
  }
  next();
};
module.exports = {
  midleware,
};
