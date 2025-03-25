const terceroServicio = {};

var respuesta = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde el index-servicio para hacer el proceso de consultar al tercero
 * @param {*} io es la variable para emitir al socket del servidor en la nube 
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datoConsulta es la variable que envia el cliente Dashboard de la data para consultar el producto
 */
terceroServicio.consultar = (io, db, datoConsulta) => {
    var consulta = 'SELECT * FROM tercero';

    switch (datoConsulta.condicion.toUpperCase()) {
        case 'CEL':
            consulta += ` WHERE celulares = ${datoConsulta.datoCondicion} OR telefonoFijo = ${datoConsulta.datoCondicion}`;
            break;
        case 'IDENTIFICACION':
            consulta += ` WHERE identificacion = '${datoConsulta.datoCondicion}'`;
            break;
        case 'ID':
            consulta += ` WHERE codigo = '${parseInt(datoConsulta.datoCondicion)}'`;
            break;
        case 'NOMBRES':
            consulta += ` WHERE nombre1 LIKE '%${datoConsulta.datoCondicion}%' OR nombre2 LIKE '%${datoConsulta.datoCondicion}%' OR apellido1 LIKE '%${datoConsulta.datoCondicion}%' OR apellido2 LIKE '%${datoConsulta.datoCondicion}%' OR razonSocial LIKE '%${datoConsulta.datoCondicion}%'`;
            break;
        default:

            break;
    }

    const { canalUsuario } = datoConsulta;

    db.sequelize.query(consulta, { type: db.sequelize.QueryTypes.SELECT})
        .then((tercero) => {
            if (tercero.length > 0) {
                respuesta = {
                    sistema: 'POS',
                    estadoPeticion: 'SUCCESS',
                    mensajePeticion: tercero,
                    tipoConsulta: 'TERCERO',
                    canalUsuario: canalUsuario
                }
               
                io.emit(datoConsulta.canalserver,JSON.stringify(respuesta));
            } else {
                respuesta = {
                    sistema: 'POS',
                    estadoPeticion: 'ERROR',
                    mensajePeticion: 'No se encontró información',
                    tipoConsulta: 'TERCERO',
                    canalUsuario: canalUsuario
                }
                console.log(respuesta)
                io.emit(datoConsulta.canalserver,JSON.stringify(respuesta));
            }
        }).catch((err) => {
            respuesta = {
                sistema: 'POS',
                estadoPeticion: 'ERROR',
                mensajePeticion: err,
                tipoConsulta: 'TERCERO',
                canalUsuario: canalUsuario
            }
            console.log(respuesta)
            io.emit(datoConsulta.canalserver,respuesta);
        });
}

module.exports = terceroServicio;