const sequelize = require("sequelize");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { Sequelize } = require("../config/db");
const { Types } = require("mysql2");

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
        res.status(200).json({
          mensaje: "recibo de ingreso creado correctamente",
          datos: resultado,
          saldoactual: countcliente[0].saldo,
          vendedor: req.session.usuario.vendedor,
          usuario: req.session.usuario.nombre,
          nombreComprobanteRI:req.session.usuario.nombreComprobanteRI,
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
    let codigoReciboUsar = ultimoCodigo[0][0].ultimoCodigo + 1;
    const consulta = `insert into reciboingreso(codigo, codigoComprobante, valor, codigoCaja, concepto, recibidoDe, estado, fechaIngreso, usuarioIngreso,
    fechaAnulo, usuarioAnulo, codigoFactura, codigoComprobanteFactura, codigoTercero, consecutivoContable, descuento, baseiva, 
    baseretencion, reteiva, reteica, retefuente, codigocuentapago,
    observacion, codigoVendedor) values(${codigoReciboUsar},${req.session.usuario.codigoComprobanteReciboIngreso},${totalrecibo},0,'${concepto}','${cliente.nombre}','ACTIVO',CURRENT_TIMESTAMP(),
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
    console.log("datos data ", facturas);

    facturas.forEach((data, index) => {
      if (data) {
        console.log("entro a actulizar recibos");
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
}

module.exports = {
  Factura: new Factura(),
};
