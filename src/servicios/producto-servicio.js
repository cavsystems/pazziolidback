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
  console.log(io.request.session);
  const sesion = io.request.session;
  const usuario = sesion?.usuario;
  const precio = usuario.precio;
  let precioconsulta = "precio1";
  switch (precio) {
    case 1:
      precioconsulta = "precio1";

      break;
    case 2:
      precioconsulta = "precio2";

      break;
    case 3:
      precioconsulta = "precio3";

      break;
    case 4:
      precioconsulta = "costo";

      break;

    default:
      precioconsulta = "precio1";
      break;
  }
  const { sequelize } = crearConexionPorNombre(usuario.db);
  let cantidad = "";
  if (usuario.almacen === "BODEGA") {
    cantidad = "cantidad";
      console.log(usuario.almacen)
  } else {
    console.log(usuario.almacen)
    cantidad = ` cantidad${(Number(usuario.almacen.slice(-1)) + 1).toString()}`;
  }
  var consulta = `SELECT ${cantidad} as cantidad ,codigo,descripcion
            ,codigocontable,codigoBarra,referencia,${precioconsulta} as precio,tasaIva,presentacion FROM productos `;
  
  switch (datoConsulta.condicion.trim().toUpperCase()) {
    case "CODIGOBARRA":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.toString().trim()}'`;
      break;
    case "REF":
      consulta += ` WHERE referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'`;
      break;
    case "ID":
      consulta += ` WHERE codigo = '${parseInt(datoConsulta.datoCondicion)}'`;
      break;
    case "DESCRIPCION":
      consulta += ` WHERE descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by descripcion limit 10`;

      break;
    case "CODIGO":
      consulta += ` WHERE codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR codigo LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' limit 1`;
      break;
    case "CODIGO-EQUAL":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.toString()}' OR codigo = '${
        datoConsulta.datoCondicion
      }' OR referencia = '${datoConsulta.datoCondicion.toString()}' limit 1`;
      break;
    default:
      consulta = `SELECT ${cantidad} as cantidad,codigo,descripcion
            ,codigocontable,codigoBarra,referencia,${precioconsulta} as precio,tasaIva,presentacion FROM productos  order by descripcion limit 10`;

      break;
  }

  const { canalUsuario } = datoConsulta;

  sequelize
    .query(consulta, { type: sequelize.QueryTypes.SELECT ,logging:true})
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
  console.log(consulta)
  let resul = await db.sequelize.query(consulta, {
    type: db.sequelize.QueryTypes.SELECT,
    logging:true
  });

  respuesta = {
    estadoPeticion: "SUCCESS",
    mensajePeticion: resul,
  };

  io.emit(datoConsulta.canalserver, respuesta);
};
module.exports = productoServicio;
