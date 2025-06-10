const sequelize = require("sequelize");
const { crearConexionPorNombre } = require("../libs/dbhelpers");

class Factura {
  async traerfactura(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio =
      req.query.pagina && req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  DATEDIFF(fechavencimiento,CURRENT_DATE) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente from  factura f inner join vendedores v inner join 
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
ORDER BY cliente `;
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
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO' order by cliente limit ?,15 ;`;
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

  abonarfactura(req, res) {
    const { factura, ingresos } = req.body;
    let valor = 0;
    console.log(factura);
    factura.forEach(async (data) => {
      const procesardata = () =>
        new Promise((reject, resolve) => {
          if (data.saldo === data.totalfactura) {
            valor = 0;
            resolve();
          } else {
            valor = data.totalfactura - ingresos.totalrecibo;
            ingresos.totalrecibo = ingresos.totalrecibo - valor;
            resolve();
          }
        });

      try {
        await procesardata();
        if (valor !== 0) {
          const { sequelize } = crearConexionPorNombre("pruebas");
          let codigo = await sequelize.query(
            "select * from reciboingreso order by codigo desc limit 1"
          );
          codigo = codigo[0].codigo + 1;

          let consulta = `insert into reciboingreso(codigo,codigoComprobante, valor, codigoCaja, concepto, recibidoDe, estado, fechaIngreso, usuarioIngreso, fechaAnulo, usuarioAnulo, codigoFactura, codigoComprobanteFactura, codigoTercero, consecutivoContable, descuento, baseiva, baseretencion, reteiva, reteica, retefuente, codigocuentapago, observacion, codigoVendedor)values(0,22,${valor},0,'','','ACTIVO',CURRENT_TIMESTAMP,13,'1990-01-01',0,${data.codigo},
        22,${data.codigotercero},0,0,0,0,0,0,0,'',${data.codigovendedor})`;
        }

        await sequelize.query(consulta, {
          type: sequelize.QueryTypes.INSERT,
        });
      } catch (err) {
        console.log("OCURRIO UN ERROR", err);
      }
    });
  }
}

module.exports = {
  Factura: new Factura(),
};
