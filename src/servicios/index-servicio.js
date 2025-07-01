const terceroServicio = require('./tercero-servicio');
const productoServicio = require('./producto-servicio');
const pedidoServicio = require('./pedido-servicio');
const sedesservi=require('./sedes-servicio')
const {inventarioservi}=require('./iventario-servicio')
const indexServicio = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde app.js para hacer los procesos de consultas dependiendo el tipo de consulta
 * @param {*} io es la variable para emitir al socket del servidor en la nube 
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datos es la variable que envia el cliente Dashboard de la data para consultar
 */
indexServicio.consultar = (io, db, datos) => {
    console.log(datos.consulta)
    switch (datos.consulta.toUpperCase()) {
        
        case 'TERCEROS':
            terceroServicio.consultar(io, db, datos); 
            break;
        case 'PRODUCTOS':
            productoServicio.consultar(io, db, datos);
            break;
        case 'SEDES':
         sedesservi.consultar(io, db, datos);
         break;
        case 'INVENTARIO':
            
        console.log(datos)
            inventarioservi.consultaritems(io, null, datos);
          break;
        default:
            break;
    }
}

/**
 * @author Cv1927
 * @description funcion que es llamada desde app.js para hacer los procesos de inserts
 * @param {*} io es la variable para emitir al socket del servidor en la nube 
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datos es la variable que envia el cliente Dashboard de la data para consultar
 */
indexServicio.crear = (io, db, datos) => {
    switch (datos.consulta.toUpperCase()) {
        case 'PEDIDO':

            pedidoServicio.crear(io, db, datos);
            break;
        default:
            break;
    }
}

indexServicio.actulizar=(io,db,datos)=>{
    switch(datos.consulta.toUpperCase()){
      case 'PRODUCTOS':
        productoServicio.actulizar(io,db,datos)
      break

    }
}



module.exports = indexServicio;