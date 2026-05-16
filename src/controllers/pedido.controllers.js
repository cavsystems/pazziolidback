const { sequelize } = require("../config/db");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { modelpedidoreservado } = require("../models/models/pedidos");
const fs = require("fs/promises");
const escpos = require("escpos");
const { response } = require("express");
const { log } = require("console");
class Pedidocontrol {
  constructor() {
   
  this.devolveritemsbodega = this.devolveritemsbodega.bind(this);
  this.anularpedido = this.anularpedido.bind(this); // 👈 AGREGA ESTO
}
  

  async obtenerpedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let consulta;
    console.log("seccion db  activa",req.session.usuario.db)
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const busqueda =
      !isNaN(req.query.busqueda) && isFinite(req.query.busqueda)
        ? req.query.busqueda
        : req.query.busqueda.toUpperCase();

        if(req.session.usuario.nivel===1){
  if (busqueda && busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where (t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%') and  p.estado='${
          req.query.estado
        }'limit  ${inicio},${15} `;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where  t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%'   limit  ${inicio},${15} `;
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where   p.estado='${req.query.estado}'  limit ${inicio},${15}`;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo  limit ${inicio},${15}`;
      }
    }

        }else{
            if (busqueda && busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } and (t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%') and  p.estado='${
          req.query.estado
        }'limit  ${inicio},${15} `;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } and t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%'   limit  ${inicio},${15} `;
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        }  and  p.estado='${req.query.estado}'  limit ${inicio},${15}`;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,COALESCE(p.totalpedido,0) as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } limit ${inicio},${15}`;
      }
    }

        }
      
  
    let pedidos_obtenidos = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
      logging: console.log

    });

    if (pedidos_obtenidos.length > 0) {
      if(req.session.usuario.nivel!==1){
        if (req.session.usuario.documento !== pedidos_obtenidos[0].cedula) {
        pedidos_obtenidos = [];
      }
      }
     
    }

    return res.status(200).json({ pedidos: pedidos_obtenidos });
  }

  async optenernumeroregistro(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let resultado;

    if(req.session.usuario.nivel===1){
 if (req.query.busqueda && req.query.busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where p.estado='${req.query.estado}' and (t.razonSocial like '%${req.query.busqueda}%'  or p.codigo like '%${req.query.busqueda}%' or v.nombre like '%${req.query.busqueda}%')`
        );
      } else {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where (t.razonSocial like '%${req.query.busqueda}%'  or p.codigo like '%${req.query.busqueda}%' or v.nombre like '%${req.query.busqueda}%')`
        );
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where p.estado='${req.query.estado}'`,
          
        );
      } else {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo`,
          
        );
      }
    }
    }else{
       if (req.query.busqueda && req.query.busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=? and p.estado='${req.query.estado}' and (t.razonSocial like '%${req.query.busqueda}%'  or p.codigo like '%${req.query.busqueda}%' or v.nombre like '%${req.query.busqueda}%')`,
          { replacements: [req.session.usuario.documento] }
        );
      } else {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=? and (t.razonSocial like '%${req.query.busqueda}%'  or p.codigo like '%${req.query.busqueda}%' or v.nombre like '%${req.query.busqueda}%')`,
          { replacements: [req.session.usuario.documento] }
        );
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=? and p.estado='${req.query.estado}'`,
          { replacements: [req.session.usuario.documento] }
        );
      } else {
        ;
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros  FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=?`,
          { replacements: [req.session.usuario.documento] }
        );
      }
    }
    }

    
    sequelize.close();

    let result = Math.ceil(resultado[0][0].nregistros / 15);
    console.log("ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",result,resultado[0][0].nregistros,req.session.usuario.documento,)
    if (result === 0) {
      result = 1;
    }
    return res
      .status(200)
      .json({ response: true, nregistros: { nregistros: result } });
  }

  async odteneritemspedido(req, res) {
    const codigopedido = req.query.codigo;
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);

    const consulta = `SELECT COALESCE(p.totalpedido,0) AS total,i.cantidad AS cantidad
     ,r.descripcion AS nombre ,precio1 AS precio
     ,r.codigo AS codigo,r.descripcion AS nombre ,r.referencia AS referencia,r.presentacion AS presentacion ,i.valor AS precio
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
  async anularpedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    try {
      let fecha = new Date();
      const pad = (n) => n.toString().padStart(2, "0");

      let diaActual =
        fecha.getFullYear() +
        "-" +
        pad(fecha.getMonth() + 1) +
        "-" +
        pad(fecha.getDate());

      let horaActual =
        pad(fecha.getHours()) +
        ":" +
        pad(fecha.getMinutes()) +
        ":" +
        pad(fecha.getSeconds());

      await sequelize.query(
        "update pedido set estado=? ,codigoUsuarioAnulo=?, fechaAnulo=?  where codigo=? and codigoUsuario=?",
        {
          replacements: [
            req.body.estado,
            Number(req.query.codigousuario),
            diaActual,
            Number(req.query.codigo),
            Number(req.query.codigousuario),
          ],
        }
      );

      await sequelize.query(
        "update itemspedido set estado=? ,usuarioAnulo=?, horaAnulacion=?  where codigoPedido=? and codigoUsuario=?",
        {
          replacements: [
            "INACTIVO",
            Number(req.query.codigousuario),
            horaActual,
            Number(req.query.codigo),
            Number(req.query.codigousuario),
          ],
        }
      );
      const productosdevolver = await sequelize.query(
  `SELECT *,i.cantidad as cantidadproduct 
   FROM itemspedido i
   INNER JOIN pedido p ON p.codigo = i.codigoPedido
   INNER JOIN productos r ON i.codigoProducto = r.codigo
   WHERE p.codigo = ?`,
  {
    replacements: [Number(req.query.codigo)],
    type: sequelize.QueryTypes.SELECT
  }
);

      console.log("productos devolver",productosdevolver)
      await this.devolveritemsbodega(req,res, productosdevolver,sequelize)

      res.status(200).json({
        response: true,
        mensaje: "Pedido anulado",
      });
    } catch (error) {
      ;
      console.log("log eror",error)
      res.status(400).json({
        response: true,
        mensaje: "Ocurrio un erro inesperado",
      });
    }
  }
obtenernombrecantidad(almacenMovimiento) {
       let cantidad = "";
       console.log("movimiento almacen",almacenMovimiento)
      if (almacenMovimiento === "BODEGA") {
        cantidad = "cantidad";
         
      } else {
        
        cantidad = ` cantidad${(Number(almacenMovimiento.slice(-1)) + 1).toString()}`;
      }
      return cantidad
    }
   async devolveritemsbodega(req,res,itemsproducts,db){
      if( req.session.usuario.separarproductospedido === 1 && req.session.usuario.almacenSeparado.trim()!="" ){
              
         let queryKardexSalida ="insert into kardex(codigo, transaccion,codigoComprobante, codigoProducto, cantidad,fechaTransaccion, fechaIngreso, codigoUsuarioIngreso, fechaAnulo, codigoUsuarioAnulo, estado, precioVenta, costo, origen, destino, codigoDocumento, codigoBodega, categoriaComprobante, costoPromedio, codigoCaja, codigoComprobanteDocumento, fechaCreacionDocumento, descripcion, codigoContable, codigoLinea,codigoGrupo, codigoVendedor)values"; 
  var queryKardexEntrada="insert into kardex(codigo, transaccion,codigoComprobante, codigoProducto, cantidad,fechaTransaccion, fechaIngreso, codigoUsuarioIngreso, fechaAnulo, codigoUsuarioAnulo, estado, precioVenta, costo, origen, destino, codigoDocumento, codigoBodega, categoriaComprobante, costoPromedio, codigoCaja, codigoComprobanteDocumento, fechaCreacionDocumento, descripcion, codigoContable, codigoLinea,codigoGrupo, codigoVendedor)values";
  let updateProductosSalida=``;
  let updateProductosEntrada=``;
  let index=0

  let con=0;




 let insertItems = new Promise((resolve, reject) => {
         let replacemententrada=[]
         let replacementsalida=[]
             let almacenOrigen=req.session.usuario.almacen;
          let almacenDestino=req.session.usuario.almacenSeparado;
            
          let etiquetaCantidadSalida=this.obtenernombrecantidad(almacenOrigen);
          let etiquetaCantidadEntrada=this.obtenernombrecantidad(almacenDestino);
          updateProductosSalida=`update productos  SET ${etiquetaCantidadEntrada} = CASE codigo`;
          updateProductosEntrada=`update productos  SET ${etiquetaCantidadSalida} = CASE codigo`;
            let clausulaWhenSalida="";let clausulaWhenEntrada="";
               let codigo="("
      itemsproducts.forEach((itemPedido) => {
        const { codigoProducto, valor, cantidad, codigoUsuario } = itemPedido;
             console.log( itemPedido)
      

     
      
        
        
       
        
          if(queryKardexSalida === ""){
              queryKardexSalida+=`(0,'SALIDA',${req.session.usuario.codigoComprobateventa},
                    ${ itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${req.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.valor},${itemPedido.costo},'${almacenDestino}','${almacenOrigen}',0,0,'TRASLADO ${almacenDestino}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.descripcion}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${req.session.usuario.codigoVendedor}
                    )`
              clausulaWhenSalida += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadEntrada} - ${itemPedido.cantidadproduct} `;
                  replacementsalida.push(itemPedido.codigoProducto);
          }else{
            queryKardexSalida+=`(0,'SALIDA',${req.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${req.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.valor},${itemPedido.costo},'${almacenDestino}','${almacenOrigen}',0,0,'TRASLADO ${almacenDestino}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.descripcion}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${req.session.usuario.codigoVendedor}
                    )`
            clausulaWhenSalida += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadEntrada} - ${itemPedido.cantidadproduct} `;
                replacementsalida.push(itemPedido.codigoProducto);
          }
          if(queryKardexEntrada === ""){
              queryKardexEntrada+=`(0,'ENTRADA',${req.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${req.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.valor},${itemPedido.costo},'${almacenOrigen}','${almacenDestino}',0,0,'TRASLADO ${almacenOrigen}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.descripcion}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${req.session.usuario.codigoVendedor}
                    )`
              clausulaWhenEntrada += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadSalida} + ${itemPedido.cantidadproduct}`;
                replacemententrada.push(itemPedido.codigoProducto);
          }else{
            queryKardexEntrada+=`(0,'ENTRADA',${req.session.usuario.codigoComprobateventa},
                    ${itemPedido.codigoProducto},${itemPedido.cantidad},current_timestamp(),current_timestamp(),${req.session.usuario.codigousuario},
                    '1990-01-01',0,"ACTIVO",${itemPedido.valor},${itemPedido.costo},'${almacenOrigen}','${almacenDestino}',0,0,'TRASLADO ${almacenOrigen}',${itemPedido.costoPromedio},0,
                    99,current_timestamp(),'${itemPedido.descripcion}','${itemPedido.codigoContable}',${itemPedido.codigoLinea},${itemPedido.codigoGrupo},${req.session.usuario.codigoVendedor}
                    )`
            clausulaWhenEntrada += ` WHEN ${itemPedido.codigoProducto} THEN ${etiquetaCantidadSalida} + ${itemPedido.cantidadproduct} `;
            replacemententrada.push(itemPedido.codigoProducto);
          }
          if(index===itemsproducts.length-1){
              codigo+="?)"
            }else{
              codigo+="?,"
            }
          
                
                 if (index <itemsproducts.length - 1 && index !==itemsproducts.length - 1 ) {
           queryKardexSalida += ",";
           queryKardexEntrada +=",";
        }
            index++

     
        con++

      });
        updateProductosSalida += clausulaWhenSalida + "END where codigo IN "+codigo
        updateProductosEntrada += clausulaWhenEntrada + " END where codigo IN "+codigo
        console.log(replacemententrada,replacementsalida)
      resolve({queryKardexSalida,queryKardexEntrada, updateProductosEntrada ,  updateProductosSalida ,replacemententrada,replacementsalida});
    });




    insertItems.then((queryValues) => {
        

         
              db.query(queryValues.queryKardexSalida, { type: db.QueryTypes.INSERT }).then((itemsalida)=>{
                                      console.log("entro a insertar product salida")
                db.query(
                  queryValues.updateProductosSalida,{ replacements:queryValues.replacementsalida, type: db.QueryTypes.UPDATE,logging: console.log}).then((itemupdatesalida)=>{
                    db.query(queryValues.queryKardexEntrada, { type: db.QueryTypes.INSERT }).then((itementrada)=>{
                      console.log("entro a insertar product")
                      db.query(queryValues.updateProductosEntrada,{ logging: console.log ,replacements: queryValues.replacemententrada,type: db.QueryTypes.UPDATE}).then((itemupdateentrada)=>{
                     
        
                                 
                                               
                      })
                  })
                  })
                                
              })
             
         
            .catch((err) => {
            console.log("de error",err)
            });
        });
    }


    

  }
  async eliminarpedidoreservado(req, res) {
    const { id } = req.params;
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

  generarpedidotirilla(req, res) {
    const tirilla = `
       ${body.config.RAZON_SOCIAL}
       ${config.NIT}
       ______________________________
       Fecha: ${req.body.fecha_actual}  ${req.body.horaActual}
       cleinte: ${req.body.cliente.nombre}
       Identificación: ${req.body.cliente.identificacion}
       direccion: ${req.body.cliente.direccion}
       telefonofijo: ${req.body.cliente.telefonoFijo}
       Vendedor: ${req.body.vendedor}
       
      
      
     `;

    return res.json({ data: { tirilla } });
  }

  async cantidad_TotalPedidosPorSemana(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        dias.nombre_dia AS dia_semana,
                        COUNT(p.fechaCreacion) AS cantidad_pedidos,
                        COALESCE(SUM(COALESCE(p.totalpedido,0)),0) AS total_Pedidos_Dia
                      FROM (
                        SELECT 'Lunes' AS nombre_dia, 0 AS dia_num UNION
                        SELECT 'Martes', 1 UNION
                        SELECT 'Miercoles', 2 UNION
                        SELECT 'Jueves', 3 UNION
                        SELECT 'Viernes', 4 UNION
                        SELECT 'Sabado', 5 UNION
                        SELECT 'Domingo', 6
                      ) AS dias
                      LEFT JOIN pedido p
                        ON WEEKDAY(p.fechaCreacion) = dias.dia_num
                        AND YEARWEEK(p.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                        AND p.codigoVendedor = ?
                      GROUP BY dias.nombre_dia, dias.dia_num
                      ORDER BY dias.dia_num;`

    const result = await sequelize.query(consulta, {
      replacements:[Number(req.query.codigoVendedor)],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({ response:true, pedidosSemana: result });

  }
async topProductosMasPedidosSemana(req, res){
  const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
  const consulta = `SELECT 
                        pr.codigo AS codigo_producto,
                        pr.descripcion AS descripcion_producto,
                        SUM(ip.cantidad) AS total_pedida
                    FROM 
                        itemspedido ip
                    JOIN 
                        pedido p ON ip.codigoPedido = p.codigo
                    JOIN 
                        productos pr ON ip.codigoProducto = pr.codigo
                    WHERE 
                        p.codigoVendedor=?
                        AND p.estado != 'ANULADO' 
                        AND YEARWEEK(p.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                    GROUP BY 
                        pr.codigo, pr.descripcion
                    ORDER BY 
                        total_pedida DESC
                    LIMIT 5;`
                  
  const result = await sequelize.query(consulta, {
    replacements:[Number(req.query.codigoVendedor)],
    type: sequelize.QueryTypes.SELECT,
  });
  sequelize.close();
  return res.status(200).json({ response:true, TopProductosSemana: result });
}

async totalPedidosVendedorMes(req, res){
  const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
  const consulta = `SELECT 
                      count(p.codigo) AS total_pedidos_mes
                    FROM 
                      pedido p
                    WHERE 
                      p.estado != 'ANULADO'
                      AND codigoVendedor = ?
                      AND MONTH(p.fechaCreacion) = MONTH(CURDATE())
                      AND YEAR(p.fechaCreacion) = YEAR(CURDATE());`
                  
  const result = await sequelize.query(consulta, {
    replacements:[Number(req.query.codigoVendedor)],
    type: sequelize.QueryTypes.SELECT,
  });
  sequelize.close();
  return res.status(200).json({ response:true, cantidadTotalPedidosMes: result });
}

  async cargarTotalPedidosVsTotalRecibosIngresoMes(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        s.semana,
                     IFNULL(COALESCE(p.totalPedidosSemana, 0), 0) AS totalPedidosSemana,
                        IFNULL(r.totalRecibosSemana, 0) AS totalRecibosSemana
                      FROM
                        (SELECT 1 AS semana UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) as s
                      LEFT JOIN (
                        SELECT 
                          WEEK(fechaCreacion, 1) - WEEK(DATE_SUB(fechaCreacion, INTERVAL DAYOFMONTH(fechaCreacion)-1 DAY), 1) + 1 AS semanaDelMes,
                          SUM(totalPedido) AS totalPedidosSemana
                        FROM pedido
                        WHERE estado != 'ANULADO'
                          AND MONTH(fechaCreacion) = MONTH(CURDATE())
                          AND YEAR(fechaCreacion) = YEAR(CURDATE())
                          AND codigoVendedor = ?
                        GROUP BY semanaDelMes
                      ) p ON s.semana = p.semanaDelMes
                      LEFT JOIN (
                        SELECT 
                          WEEK(fechaIngreso, 1) - WEEK(DATE_SUB(fechaIngreso, INTERVAL DAYOFMONTH(fechaIngreso)-1 DAY), 1) + 1 AS semanaDelMes,
                          SUM(valor) AS totalRecibosSemana
                        FROM reciboIngreso
                        WHERE MONTH(fechaIngreso) = MONTH(CURDATE())
                          AND YEAR(fechaIngreso) = YEAR(CURDATE())
                          AND codigoVendedor = ?
                        GROUP BY semanaDelMes
                      ) r ON s.semana = r.semanaDelMes
                      ORDER BY s.semana;`
    const result = await sequelize.query(consulta, {
      replacements:[
        Number(req.query.codigoVendedor),
        req.query.codigoVendedor],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close();
    return res.status(200).json({ response:true, tPedidosVsTRecibosISemas: result });
  }

  moverProductosABodegaEspecifica(almaceOrigen,almacenDestino){
    
  }

  async insertarKardeX(queryInsertKardex, sequelize){
  const consulta=`insert into kardex(codigo, transaccion,
   codigoComprobante, codigoProducto, cantidad,
    fechaTransaccion, fechaIngreso, codigoUsuarioIngreso, fechaAnulo, codigoUsuarioAnulo, estado, precioVenta, costo, origen, destino, codigoDocumento, codigoBodega, categoriaComprobante, costoPromedio, codigoCaja, codigoComprobanteDocumento, fechaCreacionDocumento, descripcion, codigoContable, codigoLinea,
   codigoGrupo, codigoVendedor)values ${queryInsertKardex}`
   const [result, affectedRows] = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.INSERT,
    }); 
     return affectedRows > 0;
  }

  async actualizarInventario(queryUpdate,replacement, sequelize){
    await sequelize.query(
        queryUpdate,
        {
         replacements: replacement,
        }
      );
  }

  async totalFacturasMes(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let consulta = ''
    const { almacenConsulta } = req.query
    if(almacenConsulta === "Todo"){
      consulta = `SELECT 
                        count(f.codigo) AS total_facturas_mes
                      FROM 
                        factura f
                      WHERE 
                        f.estado != 'ANULADO'
                        AND MONTH(f.fechaCreacion) = MONTH(CURDATE())
                        AND YEAR(f.fechaCreacion) = YEAR(CURDATE());`
    }else{
      consulta = `SELECT 
                        count(f.codigo) AS total_facturas_mes
                      FROM 
                        factura f
                      WHERE 
                        f.estado != 'ANULADO'
                        AND MONTH(f.fechaCreacion) = MONTH(CURDATE()) 
                        AND YEAR(f.fechaCreacion) = YEAR(CURDATE()) 
                        AND f.codigoComprobante in (SELECT pc.codigoComprobante FROM parametrosComprobante pc 
	                          WHERE pc.codigoParametro = (SELECT codigo FROM parametros WHERE nombre = 'ALMACEN')
		                            and pc.valor=:almacen);`
    }
    
  
                    
    const result = await sequelize.query(consulta, {
     replacements: { almacen: almacenConsulta },
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close();
    return res.status(200).json({ response:true, cantidadTotalFacturasMes: result });
  }

  async cantidad_TotalFacturasPorSemana(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const { almacenConsulta } = req.query
    let consulta = ''
    if(almacenConsulta === "Todo"){
      consulta = `SELECT 
                        dias.nombre_dia AS dia_semana,
                        COUNT(f.fechaCreacion) AS cantidad_facturas,
                        COALESCE(SUM(f.totalFactura),0) AS total_Facturas_Dia
                      FROM (
                        SELECT 'Lunes' AS nombre_dia, 0 AS dia_num UNION
                        SELECT 'Martes', 1 UNION
                        SELECT 'Miercoles', 2 UNION
                        SELECT 'Jueves', 3 UNION
                        SELECT 'Viernes', 4 UNION
                        SELECT 'Sabado', 5 UNION
                        SELECT 'Domingo', 6
                      ) AS dias
                      LEFT JOIN factura f
                        ON WEEKDAY(f.fechaCreacion) = dias.dia_num
                        AND YEARWEEK(f.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                      GROUP BY dias.nombre_dia, dias.dia_num
                      ORDER BY dias.dia_num;`
    }else{
      consulta = `SELECT 
                        dias.nombre_dia AS dia_semana,
                        COUNT(f.fechaCreacion) AS cantidad_facturas,
                        COALESCE(SUM(f.totalFactura),0) AS total_Facturas_Dia
                      FROM (
                        SELECT 'Lunes' AS nombre_dia, 0 AS dia_num UNION
                        SELECT 'Martes', 1 UNION
                        SELECT 'Miercoles', 2 UNION
                        SELECT 'Jueves', 3 UNION
                        SELECT 'Viernes', 4 UNION
                        SELECT 'Sabado', 5 UNION
                        SELECT 'Domingo', 6
                      ) AS dias
                      LEFT JOIN factura f
                        ON WEEKDAY(f.fechaCreacion) = dias.dia_num
                        AND YEARWEEK(f.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                        AND f.codigoComprobante in (SELECT pc.codigoComprobante FROM parametrosComprobante pc 
	                          WHERE pc.codigoParametro = (SELECT codigo FROM parametros WHERE nombre = 'ALMACEN')
		                            and pc.valor=:almacen)
                      GROUP BY dias.nombre_dia, dias.dia_num
                      ORDER BY dias.dia_num;`
    }
    
    console.log(consulta)

    const result = await sequelize.query(consulta, {
      replacements: { almacen: almacenConsulta },
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({ response:true, facturasSemana: result });

  }

  async topProductosMasFacturadosSemana(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const { almacenConsulta } = req.query
    let top = Number(req.query.top);
    let consulta = ''

    if (!Number.isInteger(top) || top <= 0) {
      top = 5;
    }

    if(almacenConsulta === "Todo"){
      consulta = `SELECT 
                        pr.codigo AS codigo_producto,
                        pr.descripcion AS descripcion_producto,
                        SUM(itf.cantidad) AS total_facturada
                      FROM factura f
                      JOIN itemsfactura itf 
                        ON itf.codigoFactura = f.codigo
                      AND itf.codigoComprobante = f.codigoComprobante
                      JOIN productos pr 
                        ON pr.codigo = itf.codigoProducto
                      WHERE f.estado != 'ANULADO'
                        AND f.fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                        AND f.fechaCreacion < DATE_ADD(
                            DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
                            INTERVAL 7 DAY
                        )
                      GROUP BY pr.codigo, pr.descripcion
                      ORDER BY total_facturada DESC
                      LIMIT ${top};`
    }else{
      consulta = `SELECT 
                      pr.codigo AS codigo_producto,
                      pr.descripcion AS descripcion_producto,
                      SUM(itf.cantidad) AS total_facturada
                  FROM factura f
                  JOIN itemsfactura itf
                      ON itf.codigoFactura = f.codigo
                    AND itf.codigoComprobante = f.codigoComprobante
                  JOIN productos pr
                      ON pr.codigo = itf.codigoProducto
                  JOIN parametrosComprobante pc
                      ON f.codigoComprobante = pc.codigoComprobante
                  JOIN parametros p
                      ON pc.codigoParametro = p.codigo
                  WHERE f.estado != 'ANULADO'
                    AND f.fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                    AND f.fechaCreacion < DATE_ADD(
                          DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
                          INTERVAL 7 DAY
                    )
                    AND p.nombre = 'ALMACEN'
                    AND pc.valor = :almacen
                  GROUP BY pr.codigo, pr.descripcion
                  ORDER BY total_facturada DESC
                  LIMIT ${top};`
    }

    console.log(consulta)
    
    const result = await sequelize.query(consulta, {
      replacements: { almacen: almacenConsulta, top: top },
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close();
    return res.status(200).json({ response:true, TopProductosSemana: result });
  }

  async cantidad_TotalFacturasDeLaSemana(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        dias.nombre_dia AS dia_semana,
                        COUNT(f.fechaCreacion) AS cantidad_facturas,
                        COALESCE(SUM(f.totalFactura),0) AS total_Facturas_Dia
                      FROM (
                        SELECT 'Lunes' AS nombre_dia, 0 AS dia_num UNION
                        SELECT 'Martes', 1 UNION
                        SELECT 'Miercoles', 2 UNION
                        SELECT 'Jueves', 3 UNION
                        SELECT 'Viernes', 4 UNION
                        SELECT 'Sabado', 5 UNION
                        SELECT 'Domingo', 6
                      ) AS dias
                      LEFT JOIN factura f
                        ON WEEKDAY(f.fechaCreacion) = dias.dia_num
                        AND YEARWEEK(f.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                      GROUP BY dias.nombre_dia, dias.dia_num
                      ORDER BY dias.dia_num;`

    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({ response:true, facturasSemana: result });

  }

  async cargarAlmacenes(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        almacen
                      FROM 
                        aliasalmacen;`
                    
    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close();
    return res.status(200).json({ response:true, almacenes: result });
  }
}

module.exports = {
  pedidocontroller: new Pedidocontrol(),
};
