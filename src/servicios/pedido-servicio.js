const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { generarTirillaPDF } = require("../libs/generarpdftirilla");
const { crearcorreo } = require("../libs/instanciacorreo");
const { modelpedidoreservado } = require("../models/models/pedidos");

const pedidoServicio = {};

var respuesta = {};
var dataEmail = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde el index-servicio para hacer el proceso de crear el pedido
 * @param {*} io es la variable para emitir al socket del servidor en la nube
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datoCrear es la variable que envia el cliente Dashboard de la data para crear el pedido
 */
pedidoServicio.crear = (io, db, datoCrear) => {
  const { canalUsuario } = datoCrear;

  // Valida si datoCrear no está vacio
  if (datoCrear.datos) {
    const { pedido, itemsPedido, cliente, pdf, modificaInventario } =
      datoCrear.datos;
    const { canalserver, sede } = datoCrear;

    // Valida si el objeto pedido no está vacio
    if (pedido) {
      // Valida si hay items en el pedido
      if (itemsPedido.length > 0) {
        dataEmail = {
          cliente: cliente,
          pedido: pedido,
          itemsPedido: itemsPedido,
          canalPos: process.env.CANAL,
          pdf: pdf,
          estado: cliente.email === null ? "SIN_CORREO" : "NO_ENVIADO",
        };
        console.log(pdf);
        crearPedido(
          io,
          db,
          canalUsuario,
          pedido,
          itemsPedido,
          modificaInventario,
          canalserver,
          sede,
          pdf
        );
      } else {
        respuesta = {
          sistema: "POS",
          estadoPeticion: "ERROR",
          mensajePeticion: "No puede enviar un pedido sin productos",
          tipoConsulta: "PEDIDO",
          canalUsuario: canalUsuario,
        };
        io.emit(process.env.CANALSERVIDOR, respuesta);
      }
    } else {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: "No puede enviar la información del pedido vacia",
        tipoConsulta: "PEDIDO",
        canalUsuario: canalUsuario,
      };
      io.emit(process.env.CANALSERVIDOR, respuesta);
    }
  } else {
    respuesta = {
      sistema: "POS",
      estadoPeticion: "ERROR",
      mensajePeticion: "No puede enviar pedido vacio",
      tipoConsulta: "PEDIDO",
      canalUsuario: canalUsuario,
    };
    io.emit(process.env.CANALSERVIDOR, respuesta);
  }
};

/**
 * @author Cv1927
 * @description Funcion que hace el proceso de insert del pedido
 * @param {*} io es la variable para emitir al socket del servidor en la nube
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} pedido es la variable que envia el cliente Dashboard de la data del pedido
 */
async function crearPedido(
  io,
  db,
  canalUsuario,
  pedido,
  itemsPedido,
  modificaInventario,
  canalserver,
  sede,
  pdf
) {
  const sesion = io.request.session;
  const usuario = sesion?.usuario;
  const { sequelize, usuarioaliasalmacen, vendedor, almacen } =
    crearConexionPorNombre(usuario.db);
  let codigousuario = await vendedor.findOne({
    where: {
      identificacion: usuario.documento,
    },
  });
  console.log(codigousuario.codigo);
  const {
    codigoVendedor,
    codigoTercero,
    fechaCreacion,
    horaCreacion,
    codigoFactura,
    codigoUsuarioAnulo,
    estado,
    ubicacion,
    codigoUsuario,
    descuento,
    totalPedido,
    tipoFactura,
    observacion,
    id,
  } = pedido;
  if (id !== "") {
    await modelpedidoreservado.findByIdAndDelete(id);
  }
  var queryInsert = "INSERT INTO pedido(";
  queryInsert +=
    "codigoVendedor,codigoTercero,fechaCreacion,horaCreacion,codigoFactura,codigoUsuarioAnulo,";
  queryInsert +=
    "fechaAnulo,estado,ubicacion,codigoUsuario,descuento,totalPedido,tipoFactura,observacion)";
  queryInsert += "VALUES(";
  queryInsert += `${codigousuario.codigo},${codigoUsuario},'${fechaCreacion}','${horaCreacion}',${codigoFactura},${codigoUsuarioAnulo},`;
  queryInsert += `'1970-01-01','${estado}','${ubicacion}',${codigoUsuario},${descuento},${totalPedido},'${tipoFactura}','${observacion}')`;

  sequelize
    .query(queryInsert, { type: sequelize.QueryTypes.INSERT })
    .then(([idPedido, affectedRows]) => {
      dataEmail = {
        ...dataEmail,
        pedido: {
          ...dataEmail.pedido,
          codigoPedido: idPedido[0],
        },
      };
      console.log(idPedido);
      crearItemsPedido(
        io,
        sequelize,
        canalUsuario,
        idPedido,
        itemsPedido,
        modificaInventario,
        canalserver,
        sede,
        usuario,
        pdf
      );
    })
    .catch((err) => {
      console.log(err);
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "PEDIDO",
        canalUsuario: canalUsuario,
      };
      io.emit(process.env.CANALSERVIDOR, respuesta);
    });
}

/**
 *
 * @param {*} io
 * @param {*} db
 * @param {Number} idPedido
 * @param {Array} itemsPedido
 */
function crearItemsPedido(
  io,
  db,
  canalUsuario,
  idPedido,
  itemsPedido,
  modificaInventario,
  canalserver,
  sede,
  usuario,
  pdf
) {
  var queryInsert = "INSERT INTO itemspedido(";
  queryInsert +=
    "codigoPedido,codigoProducto,valor,cantidad,estado,horaCreacion,usuarioAnulo,horaAnulacion,codigoUsuario)";
  queryInsert += "VALUES";

  var queryValues = "";

  insertItems = new Promise((resolve, reject) => {
    itemsPedido.forEach((itemPedido) => {
      const { codigoProducto, valor, cantidad, codigoUsuario } = itemPedido;

      if (queryValues === "") {
        queryValues += `(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${codigoUsuario})`;
      } else {
        queryValues += `,(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${codigoUsuario})`;
      }
    });

    resolve(queryValues);
  });

  insertItems.then((queryValues) => {
    queryInsert += queryValues;

    db.query(queryInsert, { type: db.QueryTypes.INSERT })
      .then((idItemPedido) => {
        respuesta = {
          sistema: "POS",
          estadoPeticion: "SUCCESS",
          mensajePeticion: "Se ha registrado el pedido correctamente",
          tipoConsulta: "PEDIDO",
          canalUsuario: canalUsuario,
        };
        console.log(canalserver);
        io.emit(canalserver, respuesta);
        enviarDataEmail(io, idPedido);
      })
      .catch((err) => {
        console.log(err);
        eliminarPedido(io, db, canalUsuario, idPedido);
      });
  });
}

function actualizarInventario(db, itemsPedido, sede, usuario) {
  itemsPedido.forEach((itemPedido) => {
    const { codigoProducto, cantidad } = itemPedido;
    console.log(cantidad);
    console.log(
      "cantidad" + (Number(usuario.almacen.slice(-1)) + 1).toString()
    );
    const colAlmacen =
      "cantidad" + (Number(usuario.almacen.slice(-1)) + 1).toString();
    queryUpdate = `UPDATE productos SET  ${colAlmacen}=(${colAlmacen} - ?) WHERE codigo =?;`;

    db.query(queryUpdate, {
      replacements: [cantidad, codigoProducto],
      type: db.QueryTypes.UPDATE,
    })
      .then((idItemPedido) => {
        console.log(idItemPedido);
        console.log(
          "SE HA ACTUALIZADO EL STOCK DEL PRODUCTO CON EL ID " + codigoProducto
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 * @description funcion que hace envio de la data para registrar en la bd como correo pendiente para envio
 */
async function enviarDataEmail(io, idpedido) {
  const pdfBuffer = await generarTirillaPDF(
    io.request.session.usuario,
    dataEmail.itemsPedido,
    idpedido,
    dataEmail.cliente
  );
  try {
    if (dataEmail.pdf === null) {
      let message = {
        from: `${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`,
        to: `${dataEmail.cliente.email}`,
        subject: "Message title",
        text: "Plaintext version of the message",
        html: "<p>HTML version of the message</p>",
        cc: [`${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`],
        bcc: [`${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`],
        subject: "comprobante de pedido solicitado",
        attachments: [
          {
            filename: "tirilla.pdf", //nombre del archivo
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };
      let transpor = await crearcorreo(
        io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL,
        io.request.session.usuario.config.CONTRASENA
      );
      transpor.sendMail(message, (error) => {
        if (error) {
          console.log(error);
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion:
              "pedido realizado pero correo no enviado quieres intentar",
            tipoConsulta: "PEDIDO",
            //canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        } else {
          console.log("correo enviado");
          respuesta = {
            sistema: "POS",
            estadoPeticion: "Done",
            mensajePeticion: "pedido realizado",
            tipoConsulta: "PEDIDO",
            // canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        }
      });
    } else {
      let message = {
        from: `${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`,
        to: `${dataEmail.cliente.email}`,
        subject: "Message title",
        text: "Plaintext version of the message",
        html: "<p>HTML version of the message</p>",
        cc: [`${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`],
        bcc: [`${io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL}`],
        subject: "comprobante de pedido solicitado",
        attachments: [
          {
            filename: "tirilla.pdf", //nombre del archivo
            content: pdfBuffer,
            contentType: "application/pdf",
          },
          {
            filename: "pedido.pdf", //nombre del archivo
            content: Buffer.from(dataEmail.pdf, "base64"),
            contentType: "application/pdf",
          },
        ],
      };
      let transpor = await crearcorreo(
        io.request.session.usuario.config.CORREO_ENVIO_PRINCIPAL,
        io.request.session.usuario.config.CONTRASENA
      );
      transpor.sendMail(message, (error) => {
        if (error) {
          console.log(error);
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion:
              "pedido realizado pero correo no enviado quieres intentar",
            tipoConsulta: "PEDIDO",
            //canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        } else {
          console.log("correo enviado");
          respuesta = {
            sistema: "POS",
            estadoPeticion: "Done",
            mensajePeticion: "pedido realizado",
            tipoConsulta: "PEDIDO",
            // canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 *
 * @param {*} io
 * @param {*} db
 * @param {String} canalUsuario
 * @param {Number} idPedido
 */
function eliminarPedido(io, db, canalUsuario, idPedido) {
  var queryInsert = `DELETE FROM itemspedido WHERE codigoPedido = '${idPedido}'`;
  db.query(queryInsert, { type: db.QueryTypes.DELETE })
    .then((item) => {
      var queryInsert = `DELETE FROM pedido WHERE codigo = '${idPedido}'`;
      db.query(queryInsert, { type: db.QueryTypes.DELETE })
        .then((item) => {
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion: "No se pudo hacer el registro del pedido",
            tipoConsulta: "PEDIDO",
            canalUsuario: canalUsuario,
          };
          io.emit(process.env.CANALSERVIDOR, respuesta);
        })
        .catch((err) => {
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion: err,
            tipoConsulta: "PEDIDO",
            canalUsuario: canalUsuario,
          };
          io.emit(process.env.CANALSERVIDOR, respuesta);
        });
    })
    .catch((err) => {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "PEDIDO",
        canalUsuario: canalUsuario,
      };
      io.emit(process.env.CANALSERVIDOR, respuesta);
    });
}

module.exports = pedidoServicio;
