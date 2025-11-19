const { crearConexionPorNombre } = require("../libs/dbhelpers");
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
  console.log("entro a crear")
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

   console.log("entro a crearitemspedido",io.request.session)
  const usuario = sesion?.usuario;
  const { sequelize, usuarioaliasalmacen, vendedor, almacen } =
    crearConexionPorNombre(usuario.db);
  let codigousuario = await vendedor.findOne({
    where: {
      identificacion: usuario.documento,
    },
  });
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
  queryInsert += `'1970-01-01','${estado}','${ubicacion}',${usuario.codigousuario},${descuento},${totalPedido},'${tipoFactura}','${observacion}')`;

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
      crearItemsPedido(
        io,
        sequelize,
        canalUsuario,
        idPedido,
        itemsPedido,
        modificaInventario,
        canalserver,
        sede,
        io.request.session.usuario.codigousuario,
        pdf
      );
    })
    .catch((err) => {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "PEDIDO",
        canalUsuario: canalUsuario,
      };
      ;
      console.log(err)
      io.emit(canalserver, JSON.stringify(respuesta));
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

  var queryValues = ""; var queryKardexSalida ="insert into kardex(codigo, transaccion,codigoComprobante, codigoProducto, cantidad,fechaTransaccion, fechaIngreso, codigoUsuarioIngreso, fechaAnulo, codigoUsuarioAnulo, estado, precioVenta, costo, origen, destino, codigoDocumento, codigoBodega, categoriaComprobante, costoPromedio, codigoCaja, codigoComprobanteDocumento, fechaCreacionDocumento, descripcion, codigoContable, codigoLinea,codigoGrupo, codigoVendedor)values"; 
  var queryKardexEntrada="insert into kardex(codigo, transaccion,codigoComprobante, codigoProducto, cantidad,fechaTransaccion, fechaIngreso, codigoUsuarioIngreso, fechaAnulo, codigoUsuarioAnulo, estado, precioVenta, costo, origen, destino, codigoDocumento, codigoBodega, categoriaComprobante, costoPromedio, codigoCaja, codigoComprobanteDocumento, fechaCreacionDocumento, descripcion, codigoContable, codigoLinea,codigoGrupo, codigoVendedor)values";
  let updateProductosSalida=``;
  let updateProductosEntrada=``;
  let index=0

  if( io.request.session.usuario.separarproductospedido === 1 && io.request.session.usuario.almacenSeparado.trim()!=""){
    //Inicia if
    console.log("entro a crear items pedido")
    let con=0;
     
      insertItems = new Promise((resolve, reject) => {
         let replacemententrada=[]
         let replacementsalida=[]
             let almacenOrigen=io.request.session.usuario.almacen;
          let almacenDestino=io.request.session.usuario.almacenSeparado;
              console.log("socket actual",io.iouest)
          let etiquetaCantidadSalida=obtenernombrecantidad(almacenOrigen);
          let etiquetaCantidadEntrada=obtenernombrecantidad(almacenDestino);
          updateProductosSalida=`update productos  SET ${etiquetaCantidadSalida} = CASE codigo`;
          updateProductosEntrada=`update productos  SET ${etiquetaCantidadEntrada} = CASE codigo`;
            let clausulaWhenSalida="";let clausulaWhenEntrada="";
               let codigo="("
      itemsPedido.forEach((itemPedido) => {
        const { codigoProducto, valor, cantidad, codigoUsuario } = itemPedido;
             console.log( itemPedido)
        if (queryValues === "") {
          queryValues += `(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${usuario})`;
        } else {
          queryValues += `,(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${usuario})`;
        }

     
      
        
        
       
        
          if(queryKardexSalida === ""){
              queryKardexSalida+=`(0,'SALIDA',${io.request.session.usuario.codigoComprobateventa},
                    ${ itemPedido.codigoProducto},${ itemPedido.cantidad},current_timestamp(),current_timestamp(),${io.request.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${ itemPedido.precio},${itemPedido.costo},'${almacenOrigen}','${almacenDestino}',0,0,'TRASLADO ${almacenOrigen}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.nombre}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${io.request.session.usuario.codigoVendedor}
                    )`
              clausulaWhenSalida += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadSalida} - ${itemPedido.cantidad} `;
                  replacementsalida.push(itemPedido.codigoProducto);
          }else{
            queryKardexSalida+=`(0,'SALIDA',${io.request.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${io.request.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.precio},${itemPedido.costo},'${almacenOrigen}','${almacenDestino}',0,0,'TRASLADO ${almacenOrigen}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.nombre}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${io.request.session.usuario.codigoVendedor}
                    )`
            clausulaWhenSalida += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadSalida} - ${itemPedido.cantidad} `;
                replacementsalida.push(itemPedido.codigoProducto);
          }
          if(queryKardexEntrada === ""){
              queryKardexEntrada+=`(0,'ENTRADA',${io.request.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${io.request.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.precio},${itemPedido.costo},'${almacenDestino}','${almacenOrigen}',0,0,'TRASLADO ${almacenDestino}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.nombre}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${io.request.session.usuario.codigoVendedor}
                    )`
              clausulaWhenEntrada += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadEntrada} + ${itemPedido.cantidad} `;
                replacemententrada.push(itemPedido.codigoProducto);
          }else{
            queryKardexEntrada+=`(0,'ENTRADA',${io.request.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${io.request.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.precio},${itemPedido.costo},'${almacenDestino}','${almacenOrigen}',0,0,'TRASLADO ${almacenDestino}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.nombre}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${io.request.session.usuario.codigoVendedor}
                    )`
            clausulaWhenEntrada += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadEntrada} + ${itemPedido.cantidad} `;
            replacemententrada.push(itemPedido.codigoProducto);
          }
          if(index===itemsPedido.length-1){
              codigo+="?)"
            }else{
              codigo+="?,"
            }
          
                
                 if (index < itemsPedido.length - 1 && index !== itemsPedido.length - 1 ) {
           queryKardexSalida += ",";
           queryKardexEntrada +=",";
        }
            index++

     
        con++

      });
        updateProductosSalida += clausulaWhenSalida + "END where codigo IN "+codigo
        updateProductosEntrada += clausulaWhenEntrada + " END where codigo IN "+codigo
        console.log(replacemententrada,replacementsalida)
      resolve({queryValues,queryKardexSalida,queryKardexEntrada, updateProductosEntrada ,  updateProductosSalida ,replacemententrada,replacementsalida});
    });
 
      insertItems.then((queryValues) => {
          queryInsert += queryValues.queryValues;

          db.query(queryInsert, { type: db.QueryTypes.INSERT })
            .then((idItemPedido) => {
              db.query(queryValues.queryKardexSalida, { type: db.QueryTypes.INSERT }).then((itemsalida)=>{
                db.query(
                  queryValues.updateProductosSalida,{ replacements:queryValues.replacementsalida, type: db.QueryTypes.UPDATE}).then((itemupdatesalida)=>{
                    db.query(queryValues.queryKardexEntrada, { type: db.QueryTypes.INSERT }).then((itementrada)=>{
                      db.query(queryValues.updateProductosEntrada,{  replacements: queryValues.replacemententrada,type: db.QueryTypes.UPDATE}).then((itemupdateentrada)=>{
                            respuesta = {
                            sistema: "POS",
                            estadoPeticion: "SUCCESS",
                            mensajePeticion: "Se ha registrado el pedido correctamente",
                            tipoConsulta: "PEDIDO",
                            canalUsuario: canalUsuario,
                          };
                          io.emit(canalserver, respuesta);                        
                      })
                  })
                  })
                                
              })
             
            })
            .catch((err) => {
              ;
              eliminarPedido(io, db, canalUsuario, idPedido);
            });
        });


        
    // finaliza if
  }else{
    insertItems = new Promise((resolve, reject) => {
    itemsPedido.forEach((itemPedido) => {
      const { codigoProducto, valor, cantidad, codigoUsuario } = itemPedido;

      if (queryValues === "") {
        queryValues += `(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${usuario})`;
      } else {
        queryValues += `,(${idPedido},${codigoProducto},${valor},${cantidad},'ACTIVO',CURRENT_TIME(),0,'00:00:00',${usuario})`;
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
            io.emit(canalserver, respuesta);
          })
          .catch((err) => {
            ;
            eliminarPedido(io, db, canalUsuario, idPedido);
          });
      });
  
  }
  
  
}

function actualizarInventario(db, itemsPedido, sede, usuario) {
  itemsPedido.forEach((itemPedido) => {
    const { codigoProducto, cantidad } = itemPedido;

    const colAlmacen =
      "cantidad" + (Number(usuario.almacen.slice(-1)) + 1).toString();
    queryUpdate = `UPDATE productos SET  ${colAlmacen}=(${colAlmacen} - ?) WHERE codigo =?;`;

    db.query(queryUpdate, {
      replacements: [cantidad, codigoProducto],
      type: db.QueryTypes.UPDATE,
    })
      .then((idItemPedido) => {})
      .catch((err) => {});
  });
}

/**
 * @description funcion que hace envio de la data para registrar en la bd como correo pendiente para envio
 */

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
          io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
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
function  obtenernombrecantidad(almacenMovimiento) {
       let cantidad = "";
      if (almacenMovimiento === "BODEGA") {
        cantidad = "cantidad";
         
      } else {
        
        cantidad = ` cantidad${(Number(almacenMovimiento.slice(-1)) + 1).toString()}`;
      }
      return cantidad
    }
  

module.exports = pedidoServicio;
