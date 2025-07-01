const { Router } = require("express");
const { usuarioauth } = require("../controllers/auth.controllers");
const { Factura } = require("../controllers/factura.controller");
const routerfactura = Router();

routerfactura.get("/obtenerfactura", Factura.traerfactura);
routerfactura.get("/obtenerfacturaall", Factura.traerfacturasSaldo);
routerfactura.get("/pdffactura", Factura.pdffactura);
routerfactura.post(
  "/crearreciboingreso",
  Factura.crearreciboingreso.bind(Factura)
);
routerfactura.get("/traerbancos", Factura.traerbancos);
routerfactura.get("/traerrecibos", Factura.buscarrecibocliente);
routerfactura.get("/traersaldoactual", Factura. traersaldoactual);
routerfactura.post("/insertariteminventario", Factura.insertaritmesinventario);
routerfactura.get("/consultaritemsiventario", Factura.consultaritemsinventario);

routerfactura.get("/consultaritems", Factura.consultaritems);
routerfactura.post("/eliminariteminventario", Factura.eliminariteminventario);
module.exports = {
  routerfactura,
};
