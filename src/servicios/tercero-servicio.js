const { crearConexionPorNombre } = require("../libs/dbhelpers");

const terceroServicio = {};

var respuesta = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde el index-servicio para hacer el proceso de consultar al tercero
 * @param {*} io es la variable para emitir al socket del servidor en la nube
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datoConsulta es la variable que envia el cliente Dashboard de la data para consultar el producto
 */
terceroServicio.consultar = (io, db, datoConsulta) => {
  var consulta =
    "select t.nombre1,t.razonSocial,t.identificacion,t.tipoRegimen,t.direccion,t.telefonoFijo,t.celulares,t.email,t.codigo,m.municipio,d.departamento from tercero t inner join  municipios m inner join paises p inner join departamentos d   on m.codigoDepartamento=d.codigo and m.codigo=t.codigoMunicipio and  t.codigoPais=p.codigo";
  const sesion = io.request.session;
  const usuario = sesion?.usuario;
  const { sequelize } = crearConexionPorNombre(usuario.db);
  switch (datoConsulta.condicion.toUpperCase()) {
    case "CEL":
      consulta += ` WHERE celulares = ${datoConsulta.datoCondicion} OR telefonoFijo = ${datoConsulta.datoCondicion} limit 20`;
      break;
    case "IDENTIFICACION":
      consulta += ` WHERE identificacion = '${datoConsulta.datoCondicion}' limit 20`;
      break;
    case "ID":
      consulta += ` WHERE codigo = '${parseInt(
        datoConsulta.datoCondicion
      )}limit 20'`;
      break;
    case "NOMBRES":
      consulta += ` WHERE t.nombre1 LIKE '${datoConsulta.datoCondicion}%' OR t.nombre2 LIKE '${datoConsulta.datoCondicion}%' OR t.apellido1 LIKE '${datoConsulta.datoCondicion}%' OR t.apellido2 LIKE '${datoConsulta.datoCondicion}%' OR t.razonSocial LIKE '${datoConsulta.datoCondicion}%' OR  t.identificacion  LIKE '${datoConsulta.datoCondicion}%' limit 20`;

      break;
    default:
      break;
  }

  const { canalUsuario } = datoConsulta;

  sequelize
    .query(consulta, { type: sequelize.QueryTypes.SELECT })
    .then((tercero) => {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "SUCCESS",
        mensajePeticion: tercero,
        tipoConsulta: "TERCERO",
        canalUsuario: canalUsuario,
      };

      io.emit(datoConsulta.canalserver, JSON.stringify(respuesta));
    })
    .catch((err) => {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "TERCERO",
        canalUsuario: canalUsuario,
      };
      console.log(respuesta);
      io.emit(datoConsulta.canalserver, respuesta);
    });
};

module.exports = terceroServicio;
