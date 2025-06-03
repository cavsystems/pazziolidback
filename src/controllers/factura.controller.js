const { crearConexionPorNombre } = require("../libs/dbhelpers");

class Factura {
  async traerfactura(req, res) {
    const { sequelize } = crearConexionPorNombre("pruebas");
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const consulta = `select f.codigo, c.categoria AS tipofactura, f.fechaEmision as fechaemison, f.fechaVencimiento 
    as fechavencimiento,
    f.totalFactura as totalfactura , f.saldo as saldo, f.observaciones ,
     v.nombre as vendedor, t.razonSocial as cliente from  factura f inner join vendedores v inner join 
    comprobantes c inner join tercero t on 
    v.codigo=f.codigoVendedor and  f.codigoComprobante=c.codigo and f.codigoTercero=t.codigo where t.codigo=${req.query.codigo} limit ${inicio},15 ;`;
    const result = await sequelize.query(consulta);
    res.json({ respuesta: result });
  }
}

module.exports = {
  Factura: new Factura(),
};
