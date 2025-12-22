const { Router } = require("express");
const { pedidocontroller } = require("../controllers/pedido.controllers");

const routerpedido = Router();
routerpedido.get("/obtenerpedidos", pedidocontroller.obtenerpedido);
routerpedido.get("/obteneritemspedido", pedidocontroller.odteneritemspedido);
routerpedido.post("/reservarpedido", pedidocontroller.reservarpedido);
routerpedido.get("/reservado", pedidocontroller.pedidosreversado);
routerpedido.put(
  "/actulizarreservado/:id",
  pedidocontroller.actulizarreservados
);
routerpedido.delete(
  "/eliminarpedidoreservado/:id",
  pedidocontroller.eliminarpedidoreservado
);

routerpedido.get("/obtenernumeropedido", pedidocontroller.opdetenernumropedido);
routerpedido.post("/creartirilla", pedidocontroller.generarpedidotirilla);
routerpedido.get("/obtenernregistros", pedidocontroller.optenernumeroregistro);
routerpedido.patch("/eliminarpedido", pedidocontroller.anularpedido);
routerpedido.get("/traerPedidosPorSemana", pedidocontroller.cantidad_TotalPedidosPorSemana);
routerpedido.get("/topProductosMasPedidosSemana", pedidocontroller.topProductosMasPedidosSemana);
routerpedido.get("/totalPedidosVendedorMes", pedidocontroller.totalPedidosVendedorMes);
routerpedido.get("/cargarTotalPedidosVsTotalRecibosIngresoMes", pedidocontroller.cargarTotalPedidosVsTotalRecibosIngresoMes);
routerpedido.get("/totalFacturasMes",pedidocontroller.totalFacturasMes);
routerpedido.get("/traerFacturasPorSemana", pedidocontroller.cantidad_TotalFacturasPorSemana);
routerpedido.get("/topProductosMasFacturadosSemana", pedidocontroller.topProductosMasFacturadosSemana);
routerpedido.get("/traerFacturasDeLaSemana", pedidocontroller.cantidad_TotalFacturasDeLaSemana);
routerpedido.get("/cargarAlmacenes", pedidocontroller.cargarAlmacenes);

module.exports = routerpedido;
