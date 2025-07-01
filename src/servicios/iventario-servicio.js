const { crearConexionPorNombre } = require("../libs/dbhelpers")

const inventarioservi={}
inventarioservi.consultaritems=async(io, db,datoconsulta)=>{
const {sequelize}=crearConexionPorNombre(io.request.session.usuario.db)
    const {datoCondicion}=datoconsulta
    console.log('consulta dato',datoconsulta)
    let consulta=`SELECT i.ubicacion FROM itemsinventariofisico i inner join productos  p on i.codigoProducto=p.codigo WHERE i.estado='CONTABILIZADO' && i.ubicacion LIKE '%${datoconsulta.datoCondicion.toString().trim()}%' ;`
   
    const result=await sequelize.query(consulta,{
        type:sequelize.QueryTypes.SELECT,
        logging:true
    })
    console.log(result)
    
    io.emit("respuestaitemsinventario",{
        respuesta:result
    })

}

module.exports = {inventarioservi};
