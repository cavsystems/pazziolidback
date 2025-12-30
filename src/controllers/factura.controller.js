const sequelize = require("sequelize");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { Sequelize } = require("../config/db");
const { Types } = require("mysql2");
const almacen = require("../models/almacen");

class Factura {

    constructor() {
  
    this.insertaritemsfactura=
      this.insertaritemsfactura.bind(this);
  }
  async traerfactura(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio =
      req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  IFNULL(DATEDIFF(fechavencimiento,CURRENT_DATE), 0) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente, t.identificacion, t.telefonoFijo, t.celulares, t.direccion, false as selected, 0 as abono from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where t.codigo=? && saldo<>0 && f.estado='ACTIVO' limit ?,15 ;`;
    const consultatotal = `select  COUNT(f.codigo) as nregistros  , sum(f.saldo)   as saldo  from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO' &&  t.codigo=?`;
    const result = await sequelize.query(consulta, {
      replacements: [Number(req.query.codigo), inicio],
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });

    const result2 = await sequelize.query(consultatotal, {
      replacements: [Number(req.query.codigo)],
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });

    let registros = Math.round(result2[0].nregistros / 15);

    if (registros === 0) {
      registros = 1;
    }

    res.json({
      respuesta: result,
      nregistros: registros,
      saldo: result2[0].saldo,
    });
  }

  async enviarmensajewhasapp(req,res){
   const {mensaje}=req.query


  }
  async pdffactura(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const {codigousuario}=req.query;
    let consulta;
if(!codigousuario){
consulta = `(
    SELECT 
        NULL AS codigo,
        NULL AS codigoComprobante,
        NULL AS nombre,
        NULL AS fechaEmision,
        NULL AS fechaVencimiento,
        NULL AS dias,
        NULL AS totalFactura,
        NULL AS saldo,
        NULL AS observaciones,
        NULL AS vendedor,
        t.razonSocial AS cliente,
        t.identificacion,
        t.direccion,
        t.telefonoFijo,
        t.celulares,
        m.municipio,
        SUM(f.totalFactura) AS totalCliente,
        SUM(f.saldo) AS totalSaldoCliente,
        0 AS orden
    FROM factura f
    INNER JOIN tercero t ON f.codigoTercero = t.codigo
    JOIN municipios m ON m.codigoDepartamento=t.codigoDepartamento AND m.codigoMunicipio=t.codigoMunicipio
    WHERE f.saldo <> 0 AND f.estado = 'ACTIVO' 
    GROUP BY t.codigo,    cliente,  t.identificacion,   t.direccion,  t.telefonoFijo,  t.celulares, m.municipio
)
UNION ALL
(
    SELECT 
        f.codigo,
        f.codigoComprobante,
        c.nombre,
        f.fechaEmision,
        f.fechaVencimiento,
       IFNULL(DATEDIFF(fechavencimiento,CURRENT_DATE), 0) AS dias,
        f.totalFactura,
        f.saldo,
        f.observaciones,
        v.nombre AS vendedor,
        t.razonSocial AS cliente,
        t.identificacion AS id,
        t.direccion,
        t.telefonoFijo,
        t.celulares,
        m.municipio,
        NULL AS totalCliente,
        NULL AS totalSaldoCliente,
        1 AS orden
    FROM factura f
    INNER JOIN vendedores v ON v.codigo = f.codigoVendedor
    INNER JOIN comprobantes c ON f.codigoComprobante = c.codigo
    INNER JOIN tercero t ON f.codigoTercero = t.codigo
    JOIN municipios m ON m.codigoDepartamento=t.codigoDepartamento AND m.codigoMunicipio=t.codigoMunicipio
    WHERE f.saldo <> 0 AND f.estado = 'ACTIVO'
)
 ORDER BY cliente, orden, fechaEmision ;`;
}else{
  consulta = `(
    SELECT 
        NULL AS codigo,
        NULL AS codigoComprobante,
        NULL AS nombre,
        NULL AS fechaEmision,
        NULL AS fechaVencimiento,
        NULL AS dias,
        NULL AS totalFactura,
        NULL AS saldo,
        NULL AS observaciones,
        NULL AS vendedor,
        t.razonSocial AS cliente,
        t.identificacion,
        t.direccion,
        t.telefonoFijo,
        t.celulares,
        m.municipio,
        SUM(f.totalFactura) AS totalCliente,
        SUM(f.saldo) AS totalSaldoCliente,
        0 AS orden
    FROM factura f
    INNER JOIN tercero t ON f.codigoTercero = t.codigo
    JOIN municipios m ON m.codigoDepartamento=t.codigoDepartamento AND m.codigoMunicipio=t.codigoMunicipio
    WHERE f.saldo <> 0 AND f.estado = 'ACTIVO' and t.codigo=${codigousuario}
    GROUP BY t.codigo,    cliente,  t.identificacion,   t.direccion,  t.telefonoFijo,  t.celulares, m.municipio 
)
UNION ALL
(
    SELECT 
        f.codigo,
        f.codigoComprobante,
        c.nombre,
        f.fechaEmision,
        f.fechaVencimiento,
       IFNULL(DATEDIFF(fechavencimiento,CURRENT_DATE), 0) AS dias,
        f.totalFactura,
        f.saldo,
        f.observaciones,
        v.nombre AS vendedor,
        t.razonSocial AS cliente,
        t.identificacion AS id,
        t.direccion,
        t.telefonoFijo,
        t.celulares,
        m.municipio,
        NULL AS totalCliente,
        NULL AS totalSaldoCliente,
        1 AS orden
    FROM factura f
    INNER JOIN vendedores v ON v.codigo = f.codigoVendedor
    INNER JOIN comprobantes c ON f.codigoComprobante = c.codigo
    INNER JOIN tercero t ON f.codigoTercero = t.codigo
    JOIN municipios m ON m.codigoDepartamento=t.codigoDepartamento AND m.codigoMunicipio=t.codigoMunicipio
    WHERE f.saldo <> 0 AND f.estado = 'ACTIVO' AND t.codigo=${codigousuario}
)
 ORDER BY cliente, orden, fechaEmision  ;`;
}

      
    
    
    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });
    return res.status(200).json({ respuesta: result });
  }

  async traersaldoactual(req,res){
    const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
    
  const [result] = await sequelize.query(`select sum(saldo) as suma from factura where  codigoTercero=${req.query.codigotercero} and estado='ACTIVO'`,{logging:true})
    res.json({respuesta:result, usuario:req.session.usuario.nombre})
  }
  async traerfacturasSaldo(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  IFNULL(DATEDIFF(fechavencimiento,CURRENT_DATE), 0) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente,t.email as email,t.codigo as codigotercero, t.identificacion, t.telefonoFijo, t.celulares, t.direccion, m.municipio from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo 
    JOIN municipios m ON m.codigoDepartamento=t.codigoDepartamento AND m.codigoMunicipio=t.codigoMunicipio
    where saldo<>0 && f.estado='ACTIVO' order by cliente, fechaEmision limit ?,15 ;`;
    const consultatotal = `select  COUNT(*) as nregistros,  sum(f.saldo)   as saldo from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO'`;
    const result = await sequelize.query(consulta, {
      replacements: [inicio],
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });

    const result2 = await sequelize.query(consultatotal, {
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });

    sequelize.close();

    let registros = Math.ceil(result2[0].nregistros / 15);

    if (registros === 0) {
      registros = 1;
    }

    res.json({
      respuesta: result,
      nregistros: registros,
      saldo: result2[0].saldo,
    });
  }

  async crearfactura(req,res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
      const {tercero ,itemsPedidos,totalPagar,observacion} = req.body;
      // codigoCaja
      const codigoCajaUsuario=await this.verificarCajaUsuario(req,sequelize);
    //creacion de factura

    const ultimoCodigo = await sequelize.query(
      `select max(codigo) as ultimoCodigo from factura where codigoComprobante=${req.session.usuario.codigoComprobateventa}`
    );
    
     const insertfactura = await sequelize.query(
      `insert into factura(codigo,codigoTercero,codigoComprobante,fechaCreacion,fechaEmision,fechaVencimiento,plazo,fechaCancelada,fechaAnulada,codigoUsuarioIngreso,codigoUsuarioAnulo,
      codigoUsuarioCancelo,estado,pedido,ordenCompra,codigoVendedor,remision,observaciones,descuentoPieFactura,codigoCaja,saldo,totalFactura,
      totalDescuentos,totalExenta,totalGravada,iva,iva16,iva10,iva19,base16,base10,base19,pagaCon,devuelta,reteIva,reteIca,reteFuente,codigoFactura,valorEfectivo,valorCredito,numeroTarjetaCredito,valorDebito
      ,numeroTarjetaDebito,valorCheque,numeroCheque,valorBono,numeroBono,valorCXC) values(${(ultimoCodigo[0][0].ultimoCodigo+1)},${tercero.codigo},${req.session.usuario.codigoComprobateventa},current_timestamp(),
      current_date(),current_date(),${tercero.plazo},'1990-01-01','1990-01-01',${req.session.usuario.codigousuario}
      ,0,0,'ACTIVO','0','0',${req.session.usuario.codigoVendedor},' ','${observacion}',0,${codigoCajaUsuario},${totalPagar},${totalPagar},0,${totalPagar},0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,' ',0,' ',0,' ',0,' ',${totalPagar});`

          );
      

const faultimoCodigo = await sequelize.query(
      `select max(codigo) as ultimoCodigo from factura where codigoComprobante=${req.session.usuario.codigoComprobateventa}`
    );
    
    await this.insertaritemsfactura(itemsPedidos,sequelize,faultimoCodigo[0][0].ultimoCodigo,req,codigoCajaUsuario)
   if(await this.insertartercerofactura(tercero,sequelize,faultimoCodigo[0][0].ultimoCodigo,req)) {
     const factura=await sequelize.query(`select  TIME(CONVERT_TZ(fechaCreacion, '+00:00', '-05:00')) AS horaCreacion,f.* from factura f where codigoUsuarioIngreso=${req.session.usuario.codigousuario} order by codigo desc limit 1`,{
       type: sequelize.QueryTypes.SELECT,
      logging: true,
    })

      return res.status(200).json({response:true, mensaje:"Factura creada correctamente", factura:factura[0],config:req.session.usuario.config,nombre:req.session.usuario.vendedor,prefijo:req.session.usuario.nombrecomprobateventa});

   }else{
   
    return res.status(403).json({response:true,mensaje:"Huboun error al insertar la factura"})
   };
  
  
  
  }

  async insertaritemsfactura(itemspedido,sequelize,codigofactura,req,codigoCaja){
    let consulta = `insert into itemsfactura(codigo,codigoFactura,codigoProducto,precio,tasaIva,cantidad,descuento,descripcion,costo,codigoContable,
    codigoMedida,referencia,presentacion,totalItem,codigoLinea,codigoCaja,codigoComprobante,
    codigoGrupo,fechaCreacion,impoconsumo,codigoVendedor) values`;
    let consultakardex='';
    let etiquetaCantidad=this.obtenernombrecantidad(req);
    let updateProductos=`update productos  SET ${etiquetaCantidad} = CASE codigo`;
    let clausulaWhen="";
    let codigo="("
    const replacements =[];
    
        itemspedido.forEach((data, index) => {
      if (data) {
        consulta += `(0, ${codigofactura},${data.codigoProducto},${data.precio},'${data.tasaiva}',${data.cantidad},'${data.descuento}','${data.nombre}',${data.costo},${data.codigoContable},${data.codigoMedida},'${data.referencia}','${data.presentacion}',${data.total},${data.codigoLinea},${codigoCaja},
        ${req.session.usuario.codigoComprobateventa},0,CURRENT_DATE(),
        0,${req.session.usuario.codigoVendedor})`;
        consultakardex+=`(0,'SALIDA',${req.session.usuario.codigoComprobateventa},
        ${data.codigoProducto},${data.cantidad},current_timestamp(),current_timestamp(),${req.session.usuario.codigousuario},
        '1990-01-01',0,"ACTIVO",${data.precio},${data.costo},'${req.session.usuario.almacen}','VENTA', ${codigofactura},0,'VENTAS',${data.costoPromedio},${codigoCaja},
        ${req.session.usuario.codigoComprobateventa},current_timestamp(),'${data.nombre}','${data.codigoContable}',${data.codigoLinea},${data.codigoGrupo},${req.session.usuario.codigoVendedor}
        )`
        
        clausulaWhen += ` WHEN ${data.codigoProducto} THEN ${etiquetaCantidad} - ${data.cantidad} `;

          

          if(index===itemspedido.length-1){
            codigo+="?)"
          }else{
            codigo+="?,"
          }
                            replacements.push(data.codigoProducto);

        if (index < itemspedido.length - 1 && index !== itemspedido.length - 1) {
          consulta += ",";
          consultakardex +=",";
        }
      }
    });

    updateProductos += clausulaWhen + " END, ultimaVenta = CURRENT_DATE() where codigo IN "+codigo

    const [result, affectedRows] = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.INSERT,
    });
  await  this.insertarKardeX(consultakardex,sequelize)
  await this.actualizarSaldidaInventario(updateProductos,replacements,sequelize);
    return affectedRows > 0;
  }
obtenernombrecantidad(req){
   let cantidad = "";
  if (req.session.usuario.almacen === "BODEGA") {
    cantidad = "cantidad";
     
  } else {
    
    cantidad = ` cantidad${(Number(req.session.usuario.almacen.slice(-1)) + 1).toString()}`;
  }
  return cantidad
}


  async insertartercerofactura(tercero,sequelize,ultimocodigo,req){

    const cliente=await sequelize.query(`select * from tercero where  codigo=${tercero.codigo}`,{
      type:sequelize.QueryTypes.SELECT
    });
    
    const consulta = `insert into tercerofactura(codigo, identificacion, codigoTipoIdentificacion, dv, nombre1, 
    nombre2, apellido1, apellido2, razonSocial, tipoRegimen, clasificacion, direccion, codigoDepartamento, codigoMunicipio, codigoPais, telefonoFijo,
     celulares, email,
     plazo, cupo, listaPrecios, reteFuente, reteIca, reteIva, codigoFactura, codigoComprobante)values (0,'${cliente[0].identificacion}',
${cliente[0].codigoTipoIdentificacion},${cliente[0].dv},'${cliente[0].nombre1}','${cliente[0].nombre1}','${cliente[0].apellido1}',
'${cliente[0].apellido2}','${cliente[0].razonSocial}','${cliente[0].tipoRegimen}','${cliente[0].clasificacion}',
'${cliente[0].direccion}',${cliente[0]. codigoDepartamento},${cliente[0].codigoMunicipio},${cliente[0].codigoPais},
'${cliente[0].telefonoFijo}','${cliente[0].celulares}','${cliente[0].email}',${cliente[0].plazo},
${cliente[0].cupo},${cliente[0].listaPrecios},${cliente[0].reteFuente},${cliente[0].reteIca},${cliente[0].reteIva},${ultimocodigo},${req.session.usuario.codigoComprobateventa})`

 const [result, affectedRows] = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.INSERT,
    });
     return affectedRows > 0;
      };


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

  fechaActual(){
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    ;  // Ejemplo: "2025-08-11"

    return fechaActual;
  }

  async verificarCajaUsuario(req,sequelize) {
    
    
    const consulta = `select *, date_format(fechaApertura,'%Y-%m-%d') as fechaCaja from caja where codigo = (select max(codigo) as ultimoCodigoCaja from caja where codigoUsuario=?)`;
    const fecha=this.fechaActual();
  
    const result = await sequelize.query(consulta, {
      replacements: [req.session.usuario.codigousuario],
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });
   
    let codigoCajaUsuario=0;
     let consecutivoCaja=0;
    if (result.length > 0) {
      if(result[0].fechaCaja==fecha){
        codigoCajaUsuario=result[0].codigo;
      }else if(result[0].fechaCaja<fecha){
        consecutivoCaja=result[0].consecutivo+1;
        const insertCaja = await sequelize.query(
        `insert into caja(codigo,codigoUsuario,montoInicial,montoFinal,fechaApertura,fechaCierre,
        estado,codigoComprobante,consecutivo,totalRecaudo,totalCosto) 
        values (0,${req.session.usuario.codigousuario},0,0,current_timestamp(),'1990-01-01','ABIERTA',
        ${req.session.usuario.codigoComprobateventa},${consecutivoCaja},0,0)` 
        );
       
        const consulta2 = `select max(codigo) as ultimoCodigoCaja from caja where codigoUsuario=?`;
        const result2 = await sequelize.query(consulta2,{
          replacements: [req.session.usuario.codigousuario],
          type: sequelize.QueryTypes.SELECT,
       
          logging: true,
        });
        
        codigoCajaUsuario=result2[0].ultimoCodigoCaja;
      }
    }else{
     
      const insertCaja = await sequelize.query(
       `insert into caja(codigo,codigoUsuario,montoInicial,montoFinal,fechaApertura,fechaCierre,
       estado,codigoComprobante,consecutivo,totalRecaudo,totalCosto) 
       values (0,${req.session.usuario.codigousuario},0,0,current_timestamp(),'1990-01-01','ABIERTA',
       ${req.session.usuario.codigoComprobateventa},${consecutivoCaja},0,0)` 
      );
          
      const consulta2 = `select max(codigo) as ultimoCodigoCaja from caja where codigoUsuario=?`;
      
      const result2 = await sequelize.query(consulta2, {
        replacements: [req.session.usuario.codigousuario],
        type: sequelize.QueryTypes.SELECT,
         
        logging: true,
      });
      
      codigoCajaUsuario=result2[0].ultimoCodigoCaja;
    }

    
    return codigoCajaUsuario
  
  }

  async actualizarSaldidaInventario(queryUpdate,replacement, sequelize){
    await sequelize.query(
        queryUpdate,
        {
         replacements: replacement,
        }
      );
  }

  /* async obtenernumeroregistrofactura(req,res){
       const { sequelize } = crearConexionPorNombre(req.session.usuario.db);

    if(req.query.codigotercero!==0){
     const resultado=await  sequelize.query("select COUNT(*) from factura")
    }else{
       const resultado=await  sequelize.query(`)select COUNT(*) from factura where `)
    }
      
      
      let result = Math.round(resultado[0][0].nregistros / 15);

      if (result === 0) {
      result = 1;
    }
    res.status(200).json({nregistros:result})

  }*/

  async crearreciboingreso(req, res) {
    // informacion del
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const {
      totalrecibo,
      cliente,
      concepto,
      descuento,
      observacion,
      facturas,
      tipopago,
    } = req.body;

    let codigoCuentaOtrosRC = 0;

    tipopago.forEach((data) => {
      switch (data.Movimiento) {
        case "Banco":
          codigoCuentaOtrosRC = data.opcionBanco.codigoCuenta;
          break;
        default:
          break;
      }
    });

    const codigoReciboCreado = await this.ingresoReciboCaja(
      totalrecibo,
      cliente,
      concepto,
      descuento,
      codigoCuentaOtrosRC,
      observacion,
      sequelize,
      req
    );

    if (codigoReciboCreado > 0) {
      const codigoreciboingresofactura = await this.ingresarRecibosFacturas(
        codigoReciboCreado,
        facturas,
        sequelize,
        req
      );

      if (codigoreciboingresofactura > 0) {
        await this.ingresarTiposPagoReciboIngreso(
          tipopago,
          sequelize,
          codigoReciboCreado,
          req
        );

        await this.actualizarSaldoFactura(facturas, sequelize, req);
        const [resultado] = await sequelize.query(
          `select * from reciboingreso where codigo=${codigoReciboCreado} && codigoComprobante=${req.session.usuario.codigoComprobanteReciboIngreso}`
        );

        const [countcliente] = await sequelize.query(
          `select sum(saldo) AS saldo from factura where codigoTercero=${cliente.codigo}`
        );
         
        if(req.session.usuario.manejarEntregas>0 && req.session.usuario.nivel===4 ){
         await this.procesarEntrega(totalrecibo,sequelize,req,res);
        }

     
      return res.status(200).json({
        mensaje: "recibo de ingreso creado correctamente",
        datos: resultado,
        saldoactual: countcliente[0].saldo,
        vendedor: req.session.usuario.vendedor,
        usuario: req.session.usuario.nombre,
        nombreComprobanteRI: req.session.usuario.nombreComprobanteRI,
    });
      }
    } else {
      res.status(400).json({ mensaje: "recibo de ingreso no se pudo crear" });
    }
    // informacion para recibosFacturas(un arreglo con las facturas y valor abono)
    // codigo:1, codigoComprobate:22, valor:20000
    /*for(){
        insert(codigoRecibo, codigoComprobante, codigoFactura, codigoComprobanteFactura, valor);
      }*/
    // informacion tipoPagosRecibosIngreso( un arreglo con los tipo pago reciboingreso)
  }

  async ingresoReciboCaja(
    totalrecibo,
    cliente,
    concepto,
    descuento,
    codigoCuentaOtrosRC,
    observacion,
    sequelize,
    req
  ) {


    const ultimoCodigo = await sequelize.query(
      `select max(codigo) as ultimoCodigo from reciboingreso where codigoComprobante=${req.session.usuario.codigoComprobanteReciboIngreso}`
    );
    let codigoCajaUsuario=0
    if(req.session.usuario.nivel===4){
    codigoCajaUsuario=await this.verificarCajaUsuario(req,sequelize);
    }
     
    let codigoReciboUsar = ultimoCodigo[0][0].ultimoCodigo + 1;
    const consulta = `insert into reciboingreso(codigo, codigoComprobante, valor, codigoCaja, concepto, recibidoDe, estado, fechaIngreso, usuarioIngreso,
    fechaAnulo, usuarioAnulo, codigoFactura, codigoComprobanteFactura, codigoTercero, consecutivoContable, descuento, baseiva, 
    baseretencion, reteiva, reteica, retefuente, codigocuentapago,
    observacion, codigoVendedor) values(${codigoReciboUsar},${req.session.usuario.codigoComprobanteReciboIngreso},${totalrecibo},${codigoCajaUsuario},'${concepto}','${cliente.nombre}','ACTIVO',CURRENT_TIMESTAMP(),
    ${req.session.usuario.codigousuario},'1990-01-01',0,0,0,${cliente.codigo},${codigoReciboUsar},${descuento},
    0,0,0,0,0,${codigoCuentaOtrosRC},'${observacion}',${req.session.usuario.codigoVendedor})`;
    const [result, affectedRows] = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.INSERT,
    });

    if (affectedRows > 0) {
      return codigoReciboUsar;
    } else {
      return 0;
    }
  }

  async ingresarRecibosFacturas(codigoReciboIngreso, facturas, sequelize, req) {
    let consulta =
      "insert into recibosfacturas(codigo,codigoFactura,codigoComprobante,codigoReciboCaja,codigoReciboCajaComprobante,valor)values";
    ;

    facturas.forEach((data, index) => {
      if (data) {
        ;
        consulta += `(0, ${data.codigo},${data.codigoComprobante},${codigoReciboIngreso}, ${req.session.usuario.codigoComprobanteReciboIngreso},${data.abono})`;
        if (index < facturas.length - 1 && index !== facturas.length - 1) {
          consulta += ",";
        }
      }
    });
    const [result, affectedRows] = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.INSERT,
    });

    if (affectedRows > 0) {
      return codigoReciboIngreso;
    } else {
      return 0;
    }
  }

  async ingresarTiposPagoReciboIngreso(
    tipopago,
    sequelize,
    codigoreciboingreso,
    req
  ) {
    let valorefectivo = 0,
      valorcredito = 0,
      valordebito = 0,
      valorcheque = 0,
      valorbono = 0,
      codigoCuentaOtros = 0;
    tipopago.forEach((data) => {
      switch (data.Movimiento) {
        case "Efectivo":
          valorefectivo = data.valor;
          break;
        case "Cheque":
          valorcheque = data.valor;
          break;
        case "T.Debito":
          valordebito = data.valor;
          break;

        case "T.Credito":
          valorcredito = data.valor;
          break;
        case "Banco":
          valorbono = data.valor;
          codigoCuentaOtros = data.opcionBanco.codigoCuenta;
          break;

        default:
          break;
      }
    });
    await sequelize.query(`insert into tipopagoreciboingreso(codigo, codigoReciboIngreso, valorEfectivo, valorCredito, 
        numeroTarjetaCredito, valorDebito, numeroTarjetaDebito,
         valorCheque, numeroCheque, valorBono, numeroBono, valorCXC, codigoComprobante)values(0,${codigoreciboingreso},${valorefectivo},${valorcredito},'',${valordebito},'',${valorcheque},
         '',${valorbono},'',0,${req.session.usuario.codigoComprobanteReciboIngreso})`);

    if (codigoCuentaOtros > 0) {
      await this.ingresarAnexosReciboIngreso(
        codigoreciboingreso,
        codigoCuentaOtros,
        sequelize,
        req
      );
    }
  }

  async ingresarAnexosReciboIngreso(
    codigoReciboIngreso,
    codigoCuentaOtros,
    sequelize,
    req
  ) {
    await sequelize.query(`insert into anexosreciboingreso(codigo,codigoReciboIngreso,codigoComprobante,saldo,codigoCuentaCxc,codigoCuentaOtros) 
      values(0,${codigoReciboIngreso},${req.session.usuario.codigoComprobanteReciboIngreso},0,0,${codigoCuentaOtros})`);
  }

  async traerbancos(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const bancos = await sequelize.query("select * from categoriasingresos");
 
    res.json({
      respuesta: bancos[0],
      razon: req.session.usuario.config.RAZON_SOCIAL,
      nit: req.session.usuario.config.NIT,
      direccion: req.session.usuario.config.DIRECCION,
    });
  }

  async actualizarSaldoFactura(facturas, sequelize, req) {
    let consulta = `update factura set saldo=CASE `;
    let where = ``;
    facturas.forEach((data, index) => {
      if (data) {
        consulta += `WHEN  codigo=${data.codigo} AND codigoComprobante=${data.codigoComprobante} THEN saldo - ${data.abono} \n`;
        where += `(codigo=${data.codigo} AND codigoComprobante=${data.codigoComprobante})`;
        if (index < facturas.length && index !== facturas.length - 1) {
          where += ` OR `;
        }
      }
    });
    consulta += `END WHERE ` + where;

    await sequelize.query(consulta, { Types: sequelize.QueryTypes.UPDATE });
  }

  async buscarrecibocliente(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let consulta;
    if (!req.query.razonsocial && req.query.razonsocial === "") {
      consulta = `select  r.codigo,r.valor as Valor,r.concepto,e.razonSocial,e.direccion,e.identificacion,e.codigo as codigotercero,r.fechaIngreso as fecha,
      v.nombre,t.valorEfectivo as efectivo,t.valorCredito  as credito , t.valorDebito as debito 
      , t.valorCheque as cheque  ,t.valorBono as banco ,c.nombre as comprobante  from comprobantes c inner join   Tipopagoreciboingreso t inner join reciboingreso r inner join tercero e 
      inner join vendedores v on t.codigoReciboIngreso=r.codigo  and t.codigoComprobante=c.codigo and r.codigoTercero=e.codigo and
      r.codigoVendedor=v.codigo where DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') between '${req.query.fechainicial}' and '${req.query.fechafinal}' ;`;
    } else {
      if (
        (!req.query.fechainicial && req.query.fechainicial === "") ||
        (!req.query.fechafinal && req.query.fechafinal === "")
      ) {
        consulta = `select  r.codigo,r.valor as Valor,r.concepto,e.razonSocial,e.identificacion,e.direccion,e.codigo as codigotercero,r.fechaIngreso as fecha,
      v.nombre,t.valorEfectivo as efectivo,t.valorCredito  as credito , t.valorDebito as debito 
      , t.valorCheque as cheque  ,t.valorBono as banco ,c.nombre as comprobante  from comprobantes c inner join   Tipopagoreciboingreso t inner join reciboingreso r inner join tercero e 
      inner join vendedores v on t.codigoReciboIngreso=r.codigo  and t.codigoComprobante=c.codigo and r.codigoTercero=e.codigo and
      r.codigoVendedor=v.codigo where e.razonSocial='${req.query.razonsocial}'   ;`;
      } else {
        consulta = `select  r.codigo,r.valor as Valor,r.concepto,e.razonSocial,e.direccion,e.identificacion,e.codigo as codigotercero,r.fechaIngreso as fecha,
        v.nombre,t.valorEfectivo as efectivo,t.valorCredito  as credito , t.valorDebito as debito 
        , t.valorCheque as cheque  ,t.valorBono as banco ,c.nombre as comprobante  from comprobantes c inner join   Tipopagoreciboingreso t inner join reciboingreso r inner join tercero e 
        inner join vendedores v on t.codigoReciboIngreso=r.codigo  and t.codigoComprobante=c.codigo and r.codigoTercero=e.codigo and
        r.codigoVendedor=v.codigo where e.razonSocial='${req.query.razonsocial}'&& DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') between '${req.query.fechainicial}' and '${req.query.fechafinal}';`;
      }
    }

    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });

    return res.json({ respuesta: result ,nit:req.session.usuario.config.NIT,
      nombreComprobanteRI:req.session.usuario.nombreComprobanteRI,razonsocial:req.session.usuario.config.RAZON_SOCIAL,direccion:req.session.usuario.config.DIRECCION});
  }

  async insertaritmesinventario(req,res){
    
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
   await sequelize.query(`insert into itemsinventariofisico(codigo, codigoProducto,
     codigoInventario, cantidad, fechaIngreso, codigoUsuario, estado, codigoUsuarioAnulo, 
    fechaAnulo, fechaAjuste, ubicacion)values(0,${req.body.codigo},0,${req.body.cantidad},
     CURDATE(),${req.session.usuario.codigousuario},"CONTABILIZADO",0,'1990-01-01','1990-01-01','${req.body.ubicacion}')`)

    res.json({response:true})
  }

  async consultaritemsinventario(req,res){
  //consulta para traer los items del inventario fisico
  const inicio =
      req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db);
  
    if(req.query.cliente && req.query.cliente!==""){
    const consulta=`select  sum(i.cantidad) as cantidad ,p.descripcion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO' && p.descripcion='${req.query.cliente}'  group by p.descripcion limit ${inicio},15 ;`
    const todo=`SELECT COUNT(*) AS suma FROM (
  SELECT p.descripcion
  FROM itemsinventariofisico i
  INNER JOIN productos p ON i.codigoProducto = p.codigo
  WHERE i.estado = 'CONTABILIZADO' && p.descripcion='${req.query.cliente}'
  GROUP BY p.descripcion
) AS sub;`
   const result=await sequelize.query(consulta,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   
   const [result2]=await sequelize.query(todo,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
  
   res.json({respuesta:result,nregistros:result2});
 
  }else{
    const consulta=`select sum(i.cantidad) as cantidad , p.descripcion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO'  group by p.descripcion limit ${inicio},15;`
    const todo=` SELECT COUNT(*) AS suma FROM (
  SELECT p.descripcion
  FROM itemsinventariofisico i
  INNER JOIN productos p ON i.codigoProducto = p.codigo
  WHERE i.estado = 'CONTABILIZADO'
  GROUP BY p.descripcion
) AS sub;`
   const result=await sequelize.query(consulta,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   const [result2]=await sequelize.query(todo,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   
   res.json({respuesta:result,nregistros:result2});
  }
 


  }


async obtenertotalpornombrefactura(req,res){
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db);
  const datostotal= await sequelize.query(`select  sum(saldo) as sumatotal from  factura f inner join tercero t on f.codigoTercero=t.codigo where t.razonSocial='${req.query.nombret}' AND f.estado='ACTIVO' `)
  ;
  return res.json({respuesta:datostotal[0]})
}
 async traeritemsfactura(req,res){
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
  
  const consulta=`select i.descripcion,i.cantidad,i.presentacion , i.precio,i.totalItem,i.codigoContable ,i.referencia, DATE_FORMAT(f.fechaCreacion, '%H:%i:%s')  as horacreacion,t.email,t.identificacion,t.telefonofijo ,f.codigo as codigofactura,f.observaciones from factura f inner join itemsfactura i on f.codigo=i.codigoFactura and f.codigoComprobante=i.codigoComprobante join tercerofactura as t on t.codigoFactura=i.codigoFactura and t.codigoComprobante=i.codigoComprobante  where f.codigo=${req.query.codigo} && f.codigoComprobante=${req.query.codigoComprobante} `

   

  const result=await sequelize.query(consulta,{
    type:sequelize.QueryTypes.SELECT,
    logging:true
  })

  if(result.length>0){
     res.status(200).json({respuesta:result,config:req.session.usuario.config,prefijo:req.session.usuario.nombrecomprobateventa})
   }else{
     const consulta2=`select  DATE_FORMAT(f.fechaCreacion, '%H:%i:%s')  as horacreacion,t.email,t.identificacion,t.telefonofijo ,f.codigo as codigofactura,f.observaciones from factura f inner join tercerofactura as t on t.codigoFactura=f.codigoFactura and t.codigoComprobante=f.codigoComprobante  where f.codigo=${req.query.codigo} && f.codigoComprobante=${req.query.codigoComprobante} `
     const result2=await sequelize.query(consulta2,{
    type:sequelize.QueryTypes.SELECT,
    logging:true

  })

     res.status(200).json({respuesta:result2,config:req.session.usuario.config,prefijo:req.session.usuario.nombrecomprobateventa})
   
   }

 
 }

   async insertaritmesinventario(req,res){
    
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
   await sequelize.query(`insert into itemsinventariofisico(codigo, codigoProducto,
     codigoInventario, cantidad, fechaIngreso, codigoUsuario, estado, codigoUsuarioAnulo, 
    fechaAnulo, fechaAjuste, ubicacion)values(0,${req.body.codigo},0,${req.body.cantidad},
     CURDATE(),${req.session.usuario.codigousuario},"CONTABILIZADO",0,'1990-01-01','1990-01-01','${req.body.ubicacion}')`)

    res.json({response:true})
  }

  async consultaritemsinventario(req,res){
  //consulta para traer los items del inventario fisico
  const inicio =
      req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
  const {sequelize}=crearConexionPorNombre(req.session.usuario.db);
  
    if(req.query.cliente && req.query.cliente!==""){
    const consulta=`select  sum(i.cantidad) as cantidad ,p.descripcion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO' && p.descripcion='${req.query.cliente}'  group by p.descripcion limit ${inicio},15 ;`
    const todo=`SELECT COUNT(*) AS suma FROM (
  SELECT p.descripcion
  FROM itemsinventariofisico i
  INNER JOIN productos p ON i.codigoProducto = p.codigo
  WHERE i.estado = 'CONTABILIZADO' && p.descripcion='${req.query.cliente}'
  GROUP BY p.descripcion
) AS sub;`
   const result=await sequelize.query(consulta,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   
   const [result2]=await sequelize.query(todo,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
  
   res.json({respuesta:result,nregistros:result2});
 
  }else{
    const consulta=`select sum(i.cantidad) as cantidad , p.descripcion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO'  group by p.descripcion limit ${inicio},15;`
    const todo=` SELECT COUNT(*) AS suma FROM (
  SELECT p.descripcion
  FROM itemsinventariofisico i
  INNER JOIN productos p ON i.codigoProducto = p.codigo
  WHERE i.estado = 'CONTABILIZADO'
  GROUP BY p.descripcion
) AS sub;`
   const result=await sequelize.query(consulta,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   const [result2]=await sequelize.query(todo,{
     type:sequelize.QueryTypes.SELECT,
     logging:true
   })
   
   res.json({respuesta:result,nregistros:result2});
  }
 


  }


  async consultaritems(req,res){
    //consulta para traer los items del inventario fisico
    const inicio =
        req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const {sequelize}=crearConexionPorNombre(req.session.usuario.db);
    
      if(req.query.ubicacion && req.query.ubicacion!==""){
      
      const consulta=`select  i.cantidad ,p.descripcion ,i.codigo,i.ubicacion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO' && p.descripcion='${req.query.descripcion}' &&  i.ubicacion='${req.query.ubicacion}' limit ${inicio},15 ;`
      const todo=`
    SELECT COUNT(*) AS suma
    FROM itemsinventariofisico i
    INNER JOIN productos p ON i.codigoProducto = p.codigo
    WHERE i.estado = 'CONTABILIZADO' && p.descripcion='${req.query.descripcion}' && i.ubicacion='${req.query.ubicacion}';
 
  ;`
     const result=await sequelize.query(consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     })
     
     const [result2]=await sequelize.query(todo,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     })
    
     res.json({respuesta:result,nregistros:result2});
   
    }else{
      const consulta=`select i.cantidad , p.descripcion,i.codigo,i.ubicacion from itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo where i.estado='CONTABILIZADO' &&  p.descripcion='${req.query.descripcion}' limit ${inicio},15;`
      const todo=`  SELECT COUNT(*) AS suma
    FROM itemsinventariofisico i
    INNER JOIN productos p ON i.codigoProducto = p.codigo
    WHERE i.estado = 'CONTABILIZADO' && p.descripcion='${req.query.descripcion}';`
     const result=await sequelize.query(consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     })
     const [result2]=await sequelize.query(todo,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     })
     
     res.json({respuesta:result,nregistros:result2});
    }
   
  
  
    }

    eliminariteminventario(req,res){
      const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
      
      sequelize.query(`update itemsinventariofisico set estado='ANULADO', codigoUsuarioAnulo=${req.session.usuario.codigousuario}, fechaAnulo=current_date() where codigo=${req.body.codigo}`,{logging:true})
      .then(()=>{
        res.json({response:true})
      })
      .catch((error)=>{
        console.error('Error al eliminar el item de inventario:', error);
        res.status(500).json({respuesta:false, error: 'Error al eliminar el item de inventario'});
      })
    }



    consultarfacturasxusuario(req,res){
      console.log(req.session)
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
     const {codigousuario,fechainicio,fechafin}=req.query
 console.log(req.query)
     const consulta=`select f.*,c.nombre from factura f join comprobantes c on c.codigo=f.codigoComprobante 
where  f.codigoTercero=${codigousuario} and f.estado='ACTIVO'  and f.fechaEmision between  '${fechainicio}'  and '${fechafin}'`;
       sequelize.query( consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        factura:data
      })
     }

     )
    }

    consultarreciboaux(req,res){
      const {codigofa,codigocom}=req.query
       const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
      const consulta=`select r.codigo,r.codigoComprobante,c.nombre,r.fechaIngreso,rf.valor from reciboingreso r inner join comprobantes  c on  r.codigoComprobante=c.codigo  inner join recibosfacturas
rf on rf.codigoReciboCaja=r.codigo and rf.codigoReciboCajaComprobante=r.codigoComprobante where rf.codigoFactura=${codigofa} and rf.codigoComprobante=${codigocom}
order by  r.fechaIngreso `
         sequelize.query( consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        recibos:data
      })
     }

     )
    }


    consultarauxiliarcliente(req,res){
      console.log(req.session)
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
     const {codigotercero,fechainicio,fechafin}=req.query

      const consulta=`SELECT c.nombre,datos.* FROM (
SELECT 
    r.codigo,
    r.codigoComprobante,
    DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') AS fechaEmision,
    r.valor AS totalDocumento,
    'RECIBO' AS tipoDocumento
FROM reciboingreso r 
WHERE 
    r.codigoTercero =${codigotercero}
    AND r.estado = 'ACTIVO' 
    AND DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') BETWEEN '${fechainicio}' AND '${fechafin}'

UNION ALL

SELECT 
    f.codigo,
    f.codigoComprobante,
    f.fechaEmision,
    f.valorCXC AS totalDocumento,
    'FACTURA' AS tipoDocumento
FROM factura f
WHERE 
    f.codigoTercero = ${codigotercero}
    AND f.estado = 'ACTIVO' 
    AND f.fechaEmision BETWEEN '${fechainicio}' AND '${fechafin}'
    AND f.valorCXC > 0

  

UNION ALL

SELECT 
    d.codigo,
    d.codigoComprobante,
    DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') AS fechaEmision,
    (td.valor - IFNULL(tds.valor, 0)) AS totalDocumento,
    'DEVOLUCION' AS tipoDocumento
FROM devoluciones d 
JOIN (
    SELECT codigoDevolucion, codigoComprobante, valor 
    FROM totalesDevolucion 
    WHERE item = 'TOTAL_DEVOLUCION'
) AS td 
    ON td.codigoDevolucion = d.codigo 
    AND td.codigoComprobante = d.codigoComprobante
LEFT JOIN (
    SELECT codigoDevolucion, codigoComprobante, valor 
    FROM totalesDevolucion 
    WHERE item = 'TOTAL_DESCUENTOS'
) AS tds 
    ON tds.codigoDevolucion = d.codigo 
    AND tds.codigoComprobante = d.codigoComprobante

JOIN (
	SELECT itd.* FROM itemsdevolucion itd 
    JOIN factura fd ON fd.codigo=itd.codigoFactura AND fd.codigoComprobante=itd.codigoComprobanteFactura
    WHERE fd.valorCXC>0
) AS itemsd 
	ON itemsd.codigoDevolucion=d.codigo
    AND itemsd.codigoComprobanteDevolucion=d.codigoComprobante    
WHERE 
    d.codigoTercero = ${codigotercero}
    AND DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') BETWEEN '${fechainicio}' AND '${fechafin}'

ORDER BY fechaEmision ) AS datos 
join comprobantes c on c.codigo=datos.codigocomprobante ORDER BY datos.fechaEmision;`


      sequelize.query( consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        datosaux:data
      })
     }

     ) 
    }
  
    consultarTotalesVentasXUsuarioXRangoFechas(req,res){
      console.log(req.session)
      const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
      const {codigoUsuario,codigobodega,fechainicio,fechafin}=req.query

  let consultaTotalFacturas;
  console.log( req)
  let objetoauxiliar= null;
  try {
    objetoauxiliar= JSON.parse(req.session.usuario.cteAuxiliares)
  } catch (error) {
    objetoauxiliar={respuesta:[{valor:0}]};
  }
  
  let ctesAux=''
  console.log( 'objeto auxiliar:',objetoauxiliar)
  
 objetoauxiliar.respuesta.forEach((element,index) => {
  if(index==0){
    ctesAux += ''+ element.valor
  }else{
    ctesAux += ','+ element.valor
  }
  });

  console.log( 'ctesAux:',ctesAux)

    if(Number(codigobodega)===0){
 if(Number(codigoUsuario)===0){
  // Selecciono Todo - Todo
    console.log("fechas", fechainicio,fechafin)
           consultaTotalFacturas=`select 
                                      sum(f.totalExenta) as ftExenta,
                                        sum(f.totalGravada) as ftGravada,
                                        sum(f.iva) as ftIva,
                                        sum(f.valorEfectivo) as ftEfectivo,
                                        sum(f.valorDebito) as ftDebito,
                                        sum(f.valorCredito) as ftCredito,
                                        sum(f.valorCheque) as ftCheque,
                                        sum(f.valorBono) as ftBono,
                                        sum(f.valorCXC) as ftCxc,
                                        sum(f.totalDescuentos) as ftDescuentos,
                                        sum(f.totalFactura) as totalVentas
                                    from 
                                      factura f 
                                    where 
                                      f.codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                )
                                        OR (f.codigoComprobante in (${ctesAux}) AND DATE_FORMAT(fechaCreacion, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}');`
      }else{
        // Almacen Todo - usuario especifico
           consultaTotalFacturas=`select 
                                    sum(b.ftExenta) as ftExenta,
                                    sum(b.ftGravada) as ftGravada,
                                    sum(b.ftIva) as ftIva,
                                    sum(b.ftEfectivo) as ftEfectivo,
                                    sum(b.ftDebito) as ftDebito,
                                    sum(b.ftCredito) as ftCredito,
                                    sum(b.ftCheque) as ftCheque,
                                    sum(b.ftBono) as ftBono,
                                    sum(b.ftCxc) as ftCxc,
                                    sum(b.ftDescuentos) as ftDescuentos,
                                    sum(b.totalVentas) as totalVentas
                                    from (
                                    select 
                                    sum(f.totalExenta) as ftExenta,
                                    sum(f.totalGravada) as ftGravada,
                                    sum(f.iva) as ftIva,
                                    sum(f.valorEfectivo) as ftEfectivo,
                                    sum(f.valorDebito) as ftDebito,
                                    sum(f.valorCredito) as ftCredito,
                                    sum(f.valorCheque) as ftCheque,
                                    sum(f.valorBono) as ftBono,
                                    sum(f.valorCXC) as ftCxc,
                                    sum(f.totalDescuentos) as ftDescuentos,
                                    sum(f.totalFactura) as totalVentas,
                                        f.codigoUsuarioIngreso as usuario
                                  from 
                                    factura f 
                                  where 
                                  f.codigoUsuarioIngreso=${codigoUsuario} and
                                    codigoCaja 
                                    in (
                                      SELECT codigo as codigoCaja 
                                        FROM caja 
                                        where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                        )
                                    ) as b 
                                    left join (
                                    select 
                                    sum(f.totalExenta) as ftExenta,
                                      sum(f.totalGravada) as ftGravada,
                                      sum(f.iva) as ftIva,
                                      sum(f.valorEfectivo) as ftEfectivo,
                                      sum(f.valorDebito) as ftDebito,
                                      sum(f.valorCredito) as ftCredito,
                                      sum(f.valorCheque) as ftCheque,
                                      sum(f.valorBono) as ftBono,
                                      sum(f.valorCXC) as ftCxc,
                                      sum(f.totalDescuentos) as ftDescuentos,
                                      sum(f.totalFactura) as totalVentas,
                                            doc.codigoUsuarioSepara as usuario
                                    from documentoseparado doc
                                    left join factura f on f.codigo=doc.codigoDocumento and f.codigoComprobante=doc.codigoComprobanteDocumento
                                    where doc.codigoUsuarioSepara=${codigoUsuario} and f.fechaEmision between '${fechainicio}' and '${fechafin}' and f.estado='ACTIVO') as c
                                    on c.usuario=b.usuario;`
      }
    }else{
       if(Number(codigoUsuario)===0){
        // Almacen especifico - Todo (Proceso)
           consultaTotalFacturas=`select 
                                      sum(f.totalExenta) as ftExenta,
                                        sum(f.totalGravada) as ftGravada,
                                        sum(f.iva) as ftIva,
                                        sum(f.valorEfectivo) as ftEfectivo,
                                        sum(f.valorDebito) as ftDebito,
                                        sum(f.valorCredito) as ftCredito,
                                        sum(f.valorCheque) as ftCheque,
                                        sum(f.valorBono) as ftBono,
                                        sum(f.valorCXC) as ftCxc,
                                        sum(f.totalDescuentos) as ftDescuentos,
                                        sum(f.totalFactura) as totalVentas
                                    from 
                                    
                                      factura f 
                                      join
                                      usuario u
                                      join
                                      usuariosaliasalmacen ua
                                      join
                                      aliasalmacen al
                                      on
                                      f.codigoUsuarioIngreso=u.codigo
                                      and
                                      ua.codigoUsuario =f.codigoUsuarioIngreso
                                      and
                                      al.codigo=ua.codigoAliasAlmacen
                                    where 
                                      al.codigo=${Number(codigobodega)}
                                      and
                                      codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                )
                                        OR (f.codigoComprobante in (select c.codigoComprobante from (    
                                                                        select 
                                                                          DISTINCT valor 
                                                                        from 
                                                                          parametrosComprobante 
                                                                        where 
                                                                          codigoParametro in (select codigo from parametros where nombre like 'COMPROBANTE_AUXILIAR')) as b

                                                                        inner join (
                                                                        select 
                                                                          distinct pc.codigoComprobante, pc.valor 
                                                                        from 
                                                                          gilsas.parametrosComprobante pc
                                                                        join aliasalmacen al on al.almacen=pc.valor
                                                                        where 
                                                                          pc.codigoParametro in (select codigo from parametros where nombre = 'ALMACEN')
                                                                            and al.codigo=${Number(codigobodega)}) as c 
                                                                            on c.codigoComprobante = b.valor) AND DATE_FORMAT(fechaCreacion, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}');`
      }else{
           consultaTotalFacturas=`select 
                                      sum(f.totalExenta) as ftExenta,
                                        sum(f.totalGravada) as ftGravada,
                                        sum(f.iva) as ftIva,
                                        sum(f.valorEfectivo) as ftEfectivo,
                                        sum(f.valorDebito) as ftDebito,
                                        sum(f.valorCredito) as ftCredito,
                                        sum(f.valorCheque) as ftCheque,
                                        sum(f.valorBono) as ftBono,
                                        sum(f.valorCXC) as ftCxc,
                                        sum(f.totalDescuentos) as ftDescuentos,
                                        sum(f.totalFactura) as totalVentas
                                    from 
                                        factura f 
                                    where 
                                     f.codigoUsuarioIngreso=${codigoUsuario} and
                                      codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                );`
      }
    }

     
    
        sequelize.query( consultaTotalFacturas,{
        type:sequelize.QueryTypes.SELECT,
        logging:true
     }).then(data=>{
      res.status(200).json({
        datosaux:data
      })
     }

     ) 
    }

    consultarusuario(req,res){
          const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
          const {codigousuario}=req.query
          let consulta=''
          if(codigousuario===0){
            consulta=`select codigo,nombre,nivel,estado from usuario `
          }else{
            consulta=`select   codigo,nombre,nivel,estado from usuario where codigo=${codigousuario}`
          }

             sequelize.query( consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        datoscliente:data
      })
     }

     ) 
            
    }

    consultarusuarioalmacen(req,res){
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
          const {codigobodega}=req.query
     let consulta=''
          if(Number(codigobodega)!==0){
               consulta=`select 
	u.*
from 
	usuariosaliasalmacen ual 
join usuario u inner join aliasalmacen a  on u.codigo=ual.codigoUsuario and ual.codigoAliasAlmacen=a.codigo where a.codigo=${Number(codigobodega)} AND u.estado='ACTIVO';`
          }else{
           consulta=`select * from usuario WHERE estado='ACTIVO' ;`          
          }

             sequelize.query( consulta,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
        res.status(200).json({usuarios:data})
     })
     
    }

    consultarTotalesRecibosIngresoXUsuarioXRangoFechas(req,res){
      console.log(req.session)
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
     const {codigoUsuario,codigobodega,fechainicio,fechafin}=req.query
     let  consultaTotalRecibosIngreso=''
      if(Number(codigobodega)!==0){
           if(Number(codigoUsuario)!==0){
          console.log(typeof codigotercero )
          
  consultaTotalRecibosIngreso=`select 
                                       coalesce(sum(tp.valorEfectivo),0) as TEfectivo,
                                       coalesce(sum(tp.valorDebito),0) as TDebito,
                                       coalesce(sum(tp.valorCredito),0) as TCredito,
                                       coalesce(sum(tp.valorCheque),0) as TCheque,
                                       coalesce(sum(tp.valorBono),0) as TBancos,
                                       coalesce(sum(tp.valorCxc),0) as TDescuentos,
                                       coalesce(sum(r.valor),0) as totalRecibos
                                    from 
                                      reciboingreso r

                                    join 
	                                    tipopagoreciboingreso tp on tp.codigoReciboIngreso=r.codigo and tp.codigoComprobante=r.codigoComprobante join
                                      usuario u on  u.codigo=r.usuarioIngreso  
                                    where
                                      r.usuarioIngreso=${codigoUsuario}
                                      and
                                      r.codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                );`

      }else{
        console.log("consultando recibos")
        consultaTotalRecibosIngreso=`select 
                                       coalesce(sum(tp.valorEfectivo),0) as TEfectivo,
                                       coalesce(sum(tp.valorDebito),0) as TDebito,
                                       coalesce(sum(tp.valorCredito),0) as TCredito,
                                       coalesce(sum(tp.valorCheque),0) as TCheque,
                                       coalesce(sum(tp.valorBono),0) as TBancos,
                                       coalesce(sum(tp.valorCxc),0) as TDescuentos,
                                       coalesce(sum(r.valor),0) as totalRecibos
                                    from 
                                      reciboingreso r

                                    join 
	                                    tipopagoreciboingreso tp on tp.codigoReciboIngreso=r.codigo and tp.codigoComprobante=r.codigoComprobante join
                                      usuario u on  u.codigo=r.usuarioIngreso join usuariosaliasalmacen ua on ua.codigoUsuario=u.codigo join 
                                       aliasalmacen al on al.codigo=ua.codigoAliasAlmacen
                                    where 
                                    al.codigo=${Number(codigobodega)} and 
                                    DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'`

      }
     
      }else{
            if(Number(codigoUsuario)!==0){
          console.log(typeof codigotercero )
  consultaTotalRecibosIngreso=`select 
                                       coalesce(sum(tp.valorEfectivo),0) as TEfectivo,
                                       coalesce(sum(tp.valorDebito),0) as TDebito,
                                       coalesce(sum(tp.valorCredito),0) as TCredito,
                                       coalesce(sum(tp.valorCheque),0) as TCheque,
                                       coalesce(sum(tp.valorBono),0) as TBancos,
                                       coalesce(sum(tp.valorCxc),0) as TDescuentos,
                                       coalesce(sum(r.valor),0) as totalRecibos
                                    from 
                                      reciboingreso r

                                    join 
	                                    tipopagoreciboingreso tp on tp.codigoReciboIngreso=r.codigo and tp.codigoComprobante=r.codigoComprobante join
                                      usuario u on  u.codigo=r.usuarioIngreso 
                                    where 
                                      r.usuarioIngreso=${codigoUsuario}
                                      and
                                      r.codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                );`

      }else{
        console.log("consultando recibos")
        consultaTotalRecibosIngreso=`select 
                                       coalesce(sum(tp.valorEfectivo),0) as TEfectivo,
                                       coalesce(sum(tp.valorDebito),0) as TDebito,
                                       coalesce(sum(tp.valorCredito),0) as TCredito,
                                       coalesce(sum(tp.valorCheque),0) as TCheque,
                                       coalesce(sum(tp.valorBono),0) as TBancos,
                                       coalesce(sum(tp.valorCxc),0) as TDescuentos,
                                       coalesce(sum(r.valor),0) as totalRecibos
                                    from 
                                      reciboingreso r

                                    join 
	                                    tipopagoreciboingreso tp on tp.codigoReciboIngreso=r.codigo and tp.codigoComprobante=r.codigoComprobante 
                                    where  
                                    
                                      DATE_FORMAT(r.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'`

      }

      }
      

      sequelize.query( consultaTotalRecibosIngreso,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        datosaux:data
      })
     }

     ) 
    }

    consultarTotalesRecibosEgresoXUsuarioXRangoFechas(req,res){
      console.log(req.session)
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
     const {codigoUsuario,codigobodega,fechainicio,fechafin}=req.query
  let consultaTotalRecibosEgreso
   if(Number(codigobodega)===0){
        if(Number(codigoUsuario)!==0){
      consultaTotalRecibosEgreso=`select 
                                       coalesce(sum(re.descuento),0) as tDescuentos,
                                         coalesce(sum(re.valor),0) as tEgresos
                                    from 
                                      reciboegreso re
                                     
                                    where 
                                    re.usuarioIngreso=${codigoUsuario}
                                    and
                                      codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                );`

    }else{
      consultaTotalRecibosEgreso=`select 
                                      coalesce(sum(re.descuento),0) as tDescuentos,
                                      coalesce(sum(re.valor),0) as tEgresos
                                    from 
                                  reciboegreso re
                                   
                                   where DATE_FORMAT(fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'`
    }
      
   }else{
       if(Number(codigoUsuario)!==0){
      consultaTotalRecibosEgreso=`select 
                                       coalesce(sum(re.descuento),0) as tDescuentos,
                                         coalesce(sum(re.valor),0) as tEgresos
                                    from 
                                      reciboegreso re
                                      
                                    where 
                                     
                                    re.usuarioIngreso=${codigoUsuario}
                                    and
                                 
                                      codigoCaja 
                                        in (
                                          SELECT codigo as codigoCaja 
                                                FROM caja 
                                                where DATE_FORMAT(fechaApertura, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'
                                                );`

    }else{
      consultaTotalRecibosEgreso=`select 
                                      coalesce(sum(re.descuento),0) as tDescuentos,
                                      coalesce(sum(re.valor),0) as tEgresos
                                    from 
                                  reciboegreso re
                                       join
                                      usuario u
                                      join
                                      usuariosaliasalmacen ua
                                      join
                                      aliasalmacen al
                                      on
                                       re.usuarioIngreso=u.codigo
                                      and
                                      ua.codigoUsuario =re.usuarioIngreso
                                      and
                                      al.codigo=ua.codigoAliasAlmacen
                                   where    al.codigo=${codigobodega} and DATE_FORMAT(fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}'`
    }

   }
   


      sequelize.query( consultaTotalRecibosEgreso,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        datosaux:data
      })
     }

     ) 
    }

    consultarTotalesDevolucionesXUsuarioXRangoFechas(req,res){
      console.log(req.session)
         const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
     const {codigoUsuario,codigobodega,fechainicio,fechafin}=req.query
  let consultaTotalDevoluciones
  if(Number(codigobodega)===0){
    if(Number(codigoUsuario)!==0){
      consultaTotalDevoluciones=`select 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDevolucionContado, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDescuentosContado, 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDevolucionCartera, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDescuentosCartera, 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' THEN  td.valor ELSE 0 end),0) as totalDevolucion, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' THEN  td.valor ELSE 0 end),0) as totalDescuentos 
                                from 
                                  devoluciones d
                                join
                                  totalesdevolucion td on td.codigoDevolucion=d.codigo and td.codigoComprobante=d.codigoComprobante 

                                where
                                    d.usuarioIngreso=${codigoUsuario}
                                    and
                                    DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}';`

    }else{
      consultaTotalDevoluciones=`select 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDevolucionContado, 
                                  coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDescuentosContado, 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDevolucionCartera, 
                                  coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDescuentosCartera, 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' THEN  td.valor ELSE 0 end),0) as totalDevolucion, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' THEN  td.valor ELSE 0 end),0) as totalDescuentos 
                                from 
                                  devoluciones d
                                join
                                  totalesdevolucion td on td.codigoDevolucion=d.codigo and td.codigoComprobante=d.codigoComprobante
                                where
                                   DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}';`
    }
      
  }else{
  if(Number(codigoUsuario)!==0){
      consultaTotalDevoluciones=`select 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDevolucionContado, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDescuentosContado, 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDevolucionCartera, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDescuentosCartera, 
                                    coalesce(sum(case when td.item='TOTAL_DEVOLUCION' THEN  td.valor ELSE 0 end),0) as totalDevolucion, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' THEN  td.valor ELSE 0 end),0) as totalDescuentos 
                                from 
                                  devoluciones d
                                join
                                  totalesdevolucion td on td.codigoDevolucion=d.codigo and td.codigoComprobante=d.codigoComprobante  
                                where
                                  
                                    d.usuarioIngreso=${codigoUsuario}
                                    and
                                    DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}';`

    }else{
      consultaTotalDevoluciones=`select 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDevolucionContado, 
                                  coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja>0 THEN  td.valor ELSE 0 end),0) as totalDescuentosContado, 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDevolucionCartera, 
                                  coalesce(sum(case when td.item='TOTAL_DESCUENTOS' and d.codigoCaja=0 THEN  td.valor ELSE 0 end),0) as totalDescuentosCartera, 
                                  coalesce(sum(case when td.item='TOTAL_DEVOLUCION' THEN  td.valor ELSE 0 end),0) as totalDevolucion, 
                                    coalesce(sum(case when td.item='TOTAL_DESCUENTOS' THEN  td.valor ELSE 0 end),0) as totalDescuentos 
                                from 
                                  devoluciones d
                                join
                                  totalesdevolucion td on td.codigoDevolucion=d.codigo and td.codigoComprobante=d.codigoComprobante join
                                      usuario u on  u.codigo=d.usuarioIngreso   join   usuariosaliasalmacen ua on ua.codigoUsuario=u.codigo join 
                                       aliasalmacen al on al.codigo=ua.codigoAliasAlmacen
                                where
                                     al.codigo=${codigobodega} and
                                   DATE_FORMAT(d.fechaIngreso, '%Y-%m-%d') between '${fechainicio}' and '${fechafin}';`
    }
  
  }



      sequelize.query( consultaTotalDevoluciones,{
       type:sequelize.QueryTypes.SELECT,
       logging:true
     }).then(data=>{
      res.status(200).json({
        datosaux:data
      })
     }

     ) 
    }

    async procesarEntrega(totalrecibo, sequelize, req,res){
      if(req.session.usuario.entregaPendiente !==''){
        let entrega=JSON.parse(req.session.usuario.entregaPendiente)
          const [actualizaEntrega] = await sequelize.query(
            `update entregas set valor_recaudado=valor_recaudado+${totalrecibo}, valor_entregado=valor_entregado+${totalrecibo} where codigo=${entrega.codigo}`
            ,{type:sequelize.QueryTypes.UPDATE})
            console.log("Actualizo valores de entrega pendiente")
      }else{
        const newentrega=`insert into entregas (codigo, codigo_usuario_entrega, fecha_Inicio, fecha_Final, valor_recaudado, valor_descontado, valor_entregado, codigo_usuario_autorizo, observaciones, estado) 
        values(0, ${req.session.usuario.codigousuario}, 
        current_timestamp, null, ${totalrecibo},
         0, ${totalrecibo}, 0, 
        '', 'ACTIVO')`;
          const [Insertarentrega] = await sequelize.query(newentrega,{type:sequelize.QueryTypes.INSERT})
        console.log("Inserto registro nuevo entrega.")

        let entregaPendiente = await this.traerEntregaPendiente(req.session.usuario.codigousuario,sequelize)
 
    // REASIGNAR EL OBJETO COMPLETO
 
let datosusuario = {...req.session.usuario,entregaPendiente:JSON.stringify(entregaPendiente)}

 req.session.touch();
await new Promise((resolve, reject) => {
  //SOLUCION FINAL REGERAR LA SESSION
req.session.regenerate(err => {
  if (err) console.log(err);

  req.session.usuario = datosusuario;

  req.session.save(err => {
    if (err) console.log("Error guardando nueva sesión:", err);
    console.log("Sesión regenerada");
   resolve()
  });
});

});

console.log("Sesión actualizada:", req.session.usuario);


      }
        
    }

    async traerEntregaPendiente(codigoUsuarioEntrega, sequelize){
      const [result] = await sequelize.query(
          "SELECT * FROM entregas WHERE codigo=(SELECT max(codigo) FROM entregas WHERE codigo_usuario_entrega = ? and estado='ACTIVO');",
          {
            replacements: [codigoUsuarioEntrega],
          }
        );
    
        console.log("entrega pendiente result",result)
       return result[0];
    }

    traerTotalesVentasCteAuxiliarXUsuario(codigoUSuarioConsulta, sequelize){
      const [result] = sequelize.query(
        ``
      );
    }
}

module.exports = {
  Factura: new Factura(),
};
