const sedeservi = {}


sedeservi.consultar = (io, db,datoConsulta)=>{
    consulta=`SELECT * FROM aliasalmacen`
    db.sequelize.query(consulta, { type: db.sequelize.QueryTypes.SELECT}).then((sede) => {
        console.log(sede.length)
        if (sede.length > 0) {
            respuesta = {
                sistema: 'POS',
                estadoPeticion: 'SUCCESS',
                mensajePeticion:sede,
                tipoConsulta: 'PRODUCTO',

            }
          
            io.emit(datoConsulta.canalserver,JSON.stringify(respuesta));
        } else {
            respuesta = {
                sistema: 'POS',
                estadoPeticion: 'ERROR',
                mensajePeticion: 'No se encontró información',
                tipoConsulta: 'PRODUCTO',

            }
            io.emit(datoConsulta.canalserver,respuesta);
        }
    }).catch((err) => {
        respuesta = {
            sistema: 'POS',
            estadoPeticion: 'ERROR',
            mensajePeticion: err,
            tipoConsulta: 'PRODUCTO',
           
        }
        
        console.log(respuesta)
        io.emit(datoConsulta.canalserver,respuesta);
    });
}

module.exports = sedeservi;