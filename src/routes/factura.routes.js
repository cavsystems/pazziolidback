const { Router } = require("express");
const { usuarioauth } = require("../controllers/auth.controllers");
const { Factura } = require("../controllers/factura.controller");
const routerfactura = Router();

routerfactura.get("/obtenerfactura", Factura.traerfactura);

module.exports = {
  routerfactura,
};
