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
module.exports = routerpedido;
