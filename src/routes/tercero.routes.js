const { Router } = require("express");
const { usuarioauth } = require("../controllers/auth.controllers");
const { tercerocontrollers } = require("../controllers/tercero.cotrollers");
const routertercero = Router();

routertercero.post("/guardarpedido", tercerocontrollers.guardartercero);
routertercero.get("/obtenercliente", tercerocontrollers.obtenercliente);
routertercero.delete(
  "/eliminarcliente/cliente/:id",
  tercerocontrollers.eliminarcliente
);

module.exports = routertercero;
