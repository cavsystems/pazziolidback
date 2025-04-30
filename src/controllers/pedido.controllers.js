const { sequelize } = require("../config/db");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { modelpedidoreservado } = require("../models/models/pedidos");
const fs = require("fs/promises");
const escpos = require("escpos");
class Pedidocontrol {
  constructor() {}

  async obtenerpedido(req, res) {
    console.log(req.session.usuario);
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let consulta = `SELECT p.codigo AS codigo_pedido,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,p.horaCreacion AS  hora
,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
 , p.estado AS estadopedido,p.totalpedido as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${req.session.usuario.documento}`;

    const pedidos_obtenidos = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });
    return res.status(200).json({ pedidos: pedidos_obtenidos });
  }

  async odteneritemspedido(req, res) {
    const codigopedido = req.query.codigo;
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    console.log(codigopedido);

    const consulta = `SELECT p.totalPedido AS total,i.cantidad AS cantidad
     ,r.descripcion AS nombre ,precio1 AS precio
     ,r.codigo AS codigo,r.descripcion AS nombre ,r.referencia AS referencia,r.presentacion AS presentacion ,r.precio1 AS precio
     FROM pedido p INNER JOIN itemspedido i INNER JOIN productos r INNER JOIN tercero t ON p.codigo=i.codigoPedido AND p.codigoTercero=t.codigo AND i.codigoProducto=r.codigo WHERE p.codigo=?`;
    const result = await sequelize.query(consulta, {
      replacements: [codigopedido],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({
      result,
      config: req.session.usuario.config,
      vendedor: req.session.usuario.vendedor,
    });
  }

  async reservarpedido(req, res) {
    const { cliente, productos_pedido } = req.body;
    console.log(req.body);

    const newpedidoreservado = new modelpedidoreservado({
      vendedor: req.session.usuario.documento,
      cliente: cliente,
      productos_pedido,
    });

    const nuevopedido = await newpedidoreservado.save();
    res.json({ message: "Pedido guardado", pedido: nuevopedido });
  }

  async pedidosreversado(req, res) {
    const pedido = await modelpedidoreservado.find({
      vendedor: req.session.usuario.documento,
    });

    return res.json({
      pedido,
    });
  }

  async actulizarreservados(req, res) {
    try {
      const { id } = req.params;

      const pedido = await modelpedidoreservado.findById(id);

      console.log(pedido);
      const productosreservado = await modelpedidoreservado.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      return res.json({ message: "Pedido actualizado" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "error inesperado", error: error });
    }
  }

  async eliminarpedidoreservado(req, res) {
    const { id } = req.params;
    console.log(id);
    const pedidoid = await modelpedidoreservado.findById(id);

    if (!pedidoid) {
      return res.status(400).json({ message: "pedido no existe" });
    }
    await modelpedidoreservado.findByIdAndDelete(id);
    return res.status(200).json({ repuesta: true });
  }

  async guardarfactura(req, res) {
    const { baseg4 } = req.body;
    //ESC/POS es un lenguaje de comandos creado por Epson y usado por muchas impresoras térmicas para controlar:
    /*
    Texto (centrado, negrita, tamaño)

Corte de papel

Imágenes

Códigos de barras y QR
     */

    //escpoc  es una libreria de node.js que te permite enviar comandos esc/pos facilmente a impresoras termicas conectadas:.usb .re .serie
    //npm install escpos-image También puedes instalar soporte para imágenes si vas a imprimir logos:
    // Usa USB o el tipo de conexión que tengas
    const device = new escpos.USB();
    await fs.writeFile();
  }

  async opdetenernumropedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = "select codigo from pedido order by codigo desc limit 1";
    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });

    sequelize.close();

    return res.status(200).json({ response: true, codigo: result[0] });
  }
}

module.exports = {
  pedidocontroller: new Pedidocontrol(),
};
