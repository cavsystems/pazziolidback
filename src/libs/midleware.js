const { crearConexionPorNombre } = require("./dbhelpers");

const midleware = async (req, res, next) => {
  if (!req.session?.usuario) {
    return res.json({ response: false, mensaje: "token invalido" });
  }
  if (req.session?.usuario) {
    if (req.session?.usuario.fecha) {
      const { sequelize } = crearConexionPorNombre(req.session?.usuario.db);

      const [logiado] = await sequelize.query(
        "SELECT * FROM sesiones where codigoUsuario=? AND estado=? limit 1;",
        { replacements: [req.session?.usuario.codigousuario, "ACTIVO"] }
      );

      if (logiado.length > 0) {
        if (
          new Date(logiado[0].fechaInicio).getTime() !==
          new Date(req.session?.usuario.fecha).getTime()
        ) {
          return res.json({ response: false, mensaje: "seccion desabilitada" });
        }
      } else {
        return res.json({ response: false, mensaje: "seccion desabilitada" });
      }
    }
  }
  next();
};
module.exports = {
  midleware,
};
