const { crearConexionPorNombre } = require("../libs/dbhelpers");

class Factura {
  async traerfactura(req, res) {
    
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, f.codigoComprobante, c.nombre, f.fechaEmision as fechaEmision, f.fechaVencimiento 
    as fechaVencimiento,  DATEDIFF(fechavencimiento,CURRENT_DATE) AS dias,
    f.totalFactura as totalFactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where t.codigo=? && saldo<>0 && f.estado='ACTIVO' limit ?,15 ;`;
     const consultatotal=`select  COUNT(f.codigo) as nregistros  , sum(f.saldo)   as saldo  from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO' &&  t.codigo=?`
    const result = await sequelize.query(consulta,{
      replacements:[Number(req.query.codigo),inicio],
    type: sequelize.QueryTypes.SELECT,
    logging:true
  });

    const result2= await sequelize.query(consultatotal,{
      replacements:[Number(req.query.codigo)],
    type: sequelize.QueryTypes.SELECT,
    logging:true
  });
    
  
    let registros = Math.round(result2[0].nregistros / 15);

      if (registros=== 0) {
      registros = 1;
    }
  
    res.json({ respuesta: result, nregistros:registros, saldo:result2[0].saldo });
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
    const consultatotal=`select  COUNT(*) as nregistros,  sum(f.saldo)   as saldo from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where saldo<>0 && f.estado='ACTIVO'`
    const result = await sequelize.query(consulta,{
      replacements:[inicio],
    type: sequelize.QueryTypes.SELECT,
    logging:true
  });

   const result2= await sequelize.query(consultatotal,{
   
    type: sequelize.QueryTypes.SELECT,
    logging:true
  });
  
   sequelize.close()

  
    let registros = Math.round(result2[0].nregistros / 15);

      if (registros=== 0) {
      registros = 1;
    }
  
    res.json({ respuesta: result, nregistros:registros ,saldo:result2[0].saldo});
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
}

module.exports = {
  Factura: new Factura(),
};
