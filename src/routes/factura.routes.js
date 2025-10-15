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
routerfactura.get("/traeritemsfactura", Factura.traeritemsfactura);
routerfactura.get("/obtenertotalpornombrefactura",Factura.obtenertotalpornombrefactura)
routerfactura.get("/consultaritems", Factura.consultaritems);
routerfactura.post("/eliminariteminventario", Factura.eliminariteminventario);
routerfactura.post("/realizarfactura", Factura.crearfactura.bind(Factura));
routerfactura.get("/consultarfacturasxusuario",Factura.consultarfacturasxusuario)
routerfactura.get("/consultarreciboaux",Factura.consultarreciboaux)
routerfactura.get("/consultarauxiliarcliente",Factura.consultarauxiliarcliente)
routerfactura.get("/consultarTotalesVentasXUsuarioXRangoFechas",Factura.consultarTotalesVentasXUsuarioXRangoFechas)
routerfactura.get("/consultarTotalesRecibosIngresoXUsuarioXRangoFechas",Factura.consultarTotalesRecibosIngresoXUsuarioXRangoFechas)
routerfactura.get("/consultarTotalesRecibosEgresoXUsuarioXRangoFechas",Factura.consultarTotalesRecibosEgresoXUsuarioXRangoFechas)
routerfactura.get("/consultarusuario",Factura.consultarusuario)
routerfactura.get("/consultarTotalesDevolucionesXUsuarioXRangoFechas",Factura.consultarTotalesDevolucionesXUsuarioXRangoFechas)
module.exports = {
  routerfactura,
};
