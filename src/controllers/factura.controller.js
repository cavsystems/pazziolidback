const sequelize = require("sequelize");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { Sequelize } = require("../config/db");

class Factura {
  async traerfactura(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio =
      req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  DATEDIFF(fechavencimiento,CURRENT_DATE) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente, false as selected, 0 as abono from  factura f inner join vendedores v inner join 
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
  async pdffactura(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
    f.codigo,
    f.codigoComprobante,
    c.nombre,
    f.fechaEmision,
    f.fechaVencimiento,
    DATEDIFF(f.fechaVencimiento, CURRENT_DATE) AS dias,
    f.totalFactura,
    f.saldo,
    f.observaciones,
    v.nombre AS vendedor,
    t.razonSocial AS cliente,
    totales.totalCliente,
    totales.totalSaldoCliente
FROM factura f
INNER JOIN vendedores v ON v.codigo = f.codigoVendedor
INNER JOIN comprobantes c ON f.codigoComprobante = c.codigo
INNER JOIN tercero t ON f.codigoTercero = t.codigo
INNER JOIN (
    SELECT 
        f2.codigoTercero,
        SUM(f2.totalFactura) AS totalCliente,
        SUM(f2.saldo) AS totalSaldoCliente
    FROM factura f2
    WHERE f2.saldo <> 0 AND f2.estado = 'ACTIVO' and  f2.codigoVendedor<>0
    GROUP BY f2.codigoTercero
) AS totales ON totales.codigoTercero = f.codigoTercero
WHERE f.saldo <> 0 AND f.estado = 'ACTIVO'
ORDER BY cliente,f.fechaEmision `;
    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
      logging: true,
    });
    return res.status(200).json({ respuesta: result });
  }
  async traerfacturasSaldo(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  DATEDIFF(fechavencimiento,CURRENT_DATE) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO' order by cliente, fechaEmision limit ?,15 ;`;
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

  /* async obtenernumeroregistrofactura(req,res){
       const { sequelize } = crearConexionPorNombre(req.session.usuario.db);

    if(req.query.codigotercero!==0){
     const resultado=await  sequelize.query("select COUNT(*) from factura")
    }else{
       const resultado=await  sequelize.query(`)select COUNT(*) from factura where `)
    }
      
      console.log(resultado)
      let result = Math.round(resultado[0][0].nregistros / 15);

      if (result === 0) {
      result = 1;
    }
    res.status(200).json({nregistros:result})

  }*/

 async crearreciboingreso(req, res) {

    // informacion del 
    const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
    const {totalrecibo,cliente,concepto,descuento,observacion,facturas,tipopago}=req.body
    const codigoReciboCreado = await ingresoReciboCaja(totalrecibo, cliente, concepto,descuento,observacion,sequelize)

    if(codigoReciboCreado>0){
      const codigoreciboingresofactura=await ingresarRecibosFacturas(codigoReciboCreado,facturas,sequelize);

        if( codigoreciboingresofactura>0){
          await ingresarTiposPagoReciboIngreso(tipopago,sequelize,codigoReciboCreado)

        res.json({mensaje:"recibo de ingreso creado correctamente"})

        }

    }
    // informacion para recibosFacturas(un arreglo con las facturas y valor abono) 
      // codigo:1, codigoComprobate:22, valor:20000
      /*for(){
        insert(codigoRecibo, codigoComprobante, codigoFactura, codigoComprobanteFactura, valor);
      }*/
    // informacion tipoPagosRecibosIngreso( un arreglo con los tipo pago reciboingreso)




  }

 async ingresoReciboCaja(totalrecibo,cliente, concepto,descuento,observacion,sequelize){
   
   const ultimoCodigo= await sequelize.query(`select max(codigo) as ultimoCodigo from reciboingreso where codigoComprobante=${req.session.usuario.codigoComprobanteReciboIngreso}`)
   let codigoReciboUsar=ultimoCodigo[0][0].ultimoCodigo+1;
   const consulta=`insert into reciboingreso(codigo, codigoComprobante, valor, codigoCaja, concepto, recibidoDe, estado, fechaIngreso, usuarioIngreso,
    fechaAnulo, usuarioAnulo, codigoFactura, codigoComprobanteFactura, codigoTercero, consecutivoContable, descuento, baseiva, 
    baseretencion, reteiva, reteica, retefuente, codigocuentapago,
    observacion, codigoVendedor) values(${codigoReciboUsar},${req.session.usuario.codigoComprobanteReciboIngreso},${totalrecibo},0,'${concepto}','${cliente.nombre}','ACTIVO',CURRENT_TIMESTAMP(),
    ${req.session.usuario.codigousuario},'1990-01-01',0,0,0,${cliente.codigo},${codigoReciboUsar},${descuento},
    // insert reciboIngreso()
    0,0,0,0,0,0,'${observacion}',${req.session.usuario.codigoVendedor})`
    cont [result,affectedRows] = await sequelize.query(consulta,{
      type:sequelize.QueryTypes.INSERT
    })
    
    if(affectedRows>0){
      return codigoReciboUsar;
    }else{
      return 0;
    }
  }

  
  async ingresarRecibosFacturas(codigoReciboIngreso, facturas,sequelize){
    const consulta="insert into recibosfacturas(codigo,codigoFactura,codigoComprobante,codigoReciboCaja,codigoReciboCajaComprobante,valor)values"
    facturas.forEach((data,index)=>{
      consulta+=`(0, ${facturas.codigo},${facturas.codigoComprobante},${codigoReciboIngreso}, ${req.session.usuario.codigoComprobanteReciboIngreso},${facturas.abono})`
      if(index<facturas.length-1){
        consulta+=","
      }
    })
    const [result,affectedRows] = await sequelize.query(consulta,{
      type:sequelize.QueryTypes.INSERT
    })
    
     if(affectedRows>0){

      return codigoReciboUsar;
    }else{
      return 0;
    }
  }
  
  async ingresarTiposPagoReciboIngreso(tipopago,sequelize,codigoreciboingreso){
    let valorefectivo=0,valorcredito=0,valordebito=0,valorcheque=0,valorbono=0, codigoCuentaOtros=0;
    tipopago.forEach((data)=>{
      switch (data.Movimiento) {
        case 'Efectivo':
          valorefectivo=data.valor
          break;
        case 'Cheque':
          valorcheque=data.valor
          break;
        case 'T.Debito':
          valordebito=data.valor
          break;

        case 'T.Credito':
          valorcredito=data.valor
          break;
       case 'Banco':
          valorbono=data.valor
          codigoCuentaOtros=data.opcionbanco.codigoCuenta
          break;
      
        default:
          break;
      }
    }) 
      await sequelize.query(`insert into Tipopagoreciboingreso(codigo, codigoReciboIngreso, valorEfectivo, valorCredito, 
        numeroTarjetaCredito, valorDebito, numeroTarjetaDebito,
         valorCheque, numeroCheque, valorBono, numeroBono, valorCXC, codigoComprobante)values(0,${codigoreciboingreso},${valorefectivo},${valorcredito},'',${valordebito},0,${valorcheque}
         ,${valorbono},0,0,${req.session.usuario.codigoComprobanteReciboIngreso})`)
        
         if(codigoCuentaOtros>0){
            await ingresarAnexosReciboIngreso(codigoReciboIngreso, codigoCuentaOtros)
         }
  }

 async ingresarAnexosReciboIngreso(codigoReciboIngreso, codigoCuentaOtros, sequelize){
    await sequelize.query(`insert into anexosreciboingreso(codigo,codigoReciboIngreso,codigoComprobante,saldo,codigoCuentaCxc,codigoCuentaOtros) 
      values(0,${codigoReciboIngreso},${req.session.usuario.codigoComprobanteReciboIngreso},0,0,${codigoCuentaOtros})`)
  }

  async traerbancos(req,res){
    const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
    const bancos=await sequelize.query("select * from categoriasingresos")
    res.json({respuesta:bancos[0]})
  }
}

module.exports = {
  Factura: new Factura(),
};
