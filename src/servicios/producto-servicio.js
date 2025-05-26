const productoServicio = {};
const { crearConexionPorNombre } = require("../libs/dbhelpers");
var respuesta = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde el index-servicio para hacer el proceso de cconsultar el producto
 * @param {*} io es la variable para emitir al socket del servidor en la nube
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datoConsulta es la variable que envia el cliente Dashboard de la data para consultar el producto
 */
productoServicio.consultar = (io, db, datoConsulta) => {
  const sesion = io.request.session;
  const usuario = sesion?.usuario;

  const { sequelize } = crearConexionPorNombre(usuario.db);
  let cantidad = "";
  if (usuario.almacen === "BODEGA") {
    cantidad = "cantidad";
  } else {
    cantidad = ` cantidad${(Number(usuario.almacen.slice(-1)) + 1).toString()}`;
  }
  var consulta = `SELECT ${cantidad},codigo,descripcion
            ,codigocontable,codigoBarra,referencia,precio1,tasaIva,presentacion FROM productos `;

  switch (datoConsulta.condicion.trim().toUpperCase()) {
    case "CODIGOBARRA":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.trim()}'`;
      break;
    case "REF":
      consulta += ` WHERE referencia LIKE '%${datoConsulta.datoCondicion.trim()}%'`;
      break;
    case "ID":
      consulta += ` WHERE codigo = '${parseInt(datoConsulta.datoCondicion)}'`;
      break;
    case "DESCRIPCION":
      consulta += ` WHERE descripcion LIKE '${datoConsulta.datoCondicion.trim()}%' OR  referencia LIKE '${datoConsulta.datoCondicion.trim()}%'  OR codigoBarra LIKE '${datoConsulta.datoCondicion.trim()}%' order by descripcion`;

      break;
    case "CODIGO":
      consulta += ` WHERE codigoBarra LIKE '%${datoConsulta.datoCondicion.trim()}%' OR codigo LIKE '%${datoConsulta.datoCondicion.trim()}%' OR referencia LIKE '%${datoConsulta.datoCondicion.trim()}%'`;
      break;
    case "CODIGO-EQUAL":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.trim()}' OR codigo = '${datoConsulta.datoCondicion.trim()}' OR referencia = '${datoConsulta.datoCondicion.trim()}'`;
      break;
    default:
      consulta = `SELECT ${cantidad},codigo,descripcion
            ,codigocontable,codigoBarra,referencia,precio1,tasaIva,presentacion FROM productos  order by descripcion`;

      break;
  }

  const { canalUsuario } = datoConsulta;

  sequelize
    .query(consulta, { type: sequelize.QueryTypes.SELECT })
    .then((producto) => {
      console.log(producto);
      if (producto.length > 0) {
        respuesta = {
          sistema: "POS",
          estadoPeticion: "SUCCESS",
          mensajePeticion: producto,
          tipoConsulta: "PRODUCTO",
          canalUsuario: canalUsuario,
        };

        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      } else {
        console.log("error aqui");
        respuesta = {
          sistema: "POS",
          estadoPeticion: "ERROR",
          mensajePeticion: "No se encontró información",
          tipoConsulta: "PRODUCTO",
          canalUsuario: canalUsuario,
        };

        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      }
    })
    .catch((err) => {
      console.log(err);
      console.log(err);
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "PRODUCTO",
        canalUsuario: canalUsuario,
      };

      io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
    })
    .finally(async () => await sequelize.close());
};

productoServicio.actulizar = async (io, db, datoConsulta) => {
  let consulta;
  switch (datoConsulta.condicion.toUpperCase()) {
    case "CANTIDAD":
      // update =`UPDATE productos SET  cantidad${datoConsulta.almacen.slice(-1)}=${datoConsulta.decremento} where codigo=${datoConsulta.codigo}`
      consulta = `SELECT ${
        "cantidad" + datoConsulta.sede.slice(-1)
      },codigo,descripcion
            ,codigocontable,referencia,precio1 FROM productos`;
      break;

    default:
      break;
  }
  //await db.sequelize.query(update,{ type: db.sequelize.QueryTypes.UPDATE})
  let resul = await db.sequelize.query(consulta, {
    type: db.sequelize.QueryTypes.SELECT,
  });

  respuesta = {
    estadoPeticion: "SUCCESS",
    mensajePeticion: resul,
  };

  io.emit(datoConsulta.canalserver, respuesta);
};
module.exports = productoServicio;
