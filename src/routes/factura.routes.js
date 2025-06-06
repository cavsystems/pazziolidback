const { Router } = require("express");
const { usuarioauth } = require("../controllers/auth.controllers");
const { Factura } = require("../controllers/factura.controller");
const routerfactura = Router();

routerfactura.get("/obtenerfactura", Factura.traerfactura);
routerfactura.get("/obtenerfacturaall", Factura.traerfacturasSaldo);
routerfactura.get("/pdffactura", Factura.pdffactura);

module.exports = {
  routerfactura,
};
