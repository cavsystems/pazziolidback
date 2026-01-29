const productoServicio = {};
const { crearConexionPorNombre } = require("../libs/dbhelpers");
var respuesta = {};

/**
 * @author Cv1927
 * @description funcion que es llamada desde el index-servicio para hacer el proceso de cconsultar el producto
 * @param {*} io es la variable para emitir al socket del servidor en la nube
 * @param {*} db es la variable que tiene la conexion a la bd del pos y ejecuta las consultas
 * @param {*} datoConsulta es la variable que envia el cliente Dashboard de la data para consultar el producto
 */
productoServicio.consultar = async (io, db, datoConsulta) => {
  
  const sesion = io.request.session;
  const usuario = sesion?.usuario;
  const precio = usuario.precio;
  let  inventariototal=0;
  let registro=0
  let precioconsulta = "precio1";
  switch (precio) {
    case 1:
      precioconsulta = "precio1";

      break;
    case 2:
      precioconsulta = "precio2";

      break;
    case 3:
      precioconsulta = "precio3";

      break;
    case 4:
      precioconsulta = "costo";

      break;

    default:
      precioconsulta = "precio1";
      break;
  }
  const { sequelize } = crearConexionPorNombre(usuario.db);
  let cantidad = "";
  let invencan
  if (usuario.almacen === "BODEGA") {
    cantidad = "cantidad";
      
  } else {
    
    cantidad = ` cantidad${(Number(usuario.almacen.slice(-1)) + 1).toString()}`;
  }
  var consulta = `SELECT ${cantidad} as cantidad ,codigo,descripcion,costo,costoPromedio,codigoUnidadMedida as codigoMedida,descuento
            ,codigocontable,codigoBarra,referencia,${precioconsulta} as precio,tasaIva,presentacion,codigoLinea,costoPromedio,codigoGrupo FROM productos `;
  
  switch (datoConsulta.condicion.trim().toUpperCase()) {
    case "CODIGOBARRA":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.toString().trim()}'`;
      break;
    case "REF":
      consulta += ` WHERE referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'`;
      break;
    case "ID":
      consulta += ` WHERE codigo = '${parseInt(datoConsulta.datoCondicion)}'`;
      break;
    case "DESCRIPCION":
      consulta += ` WHERE descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by descripcion limit 10`;

      break;

        case "BODEGA":
      consulta = `select * from aliasalmacen`;

      break;


      case "LINEAS":
          consulta=`select * from lineas`;
        break;


          case "GRUPOS":
          consulta=`select * from grupos`;
        break;



       case "DESCRIPCIONINVENTARIO":
           let consultotalinventariodes=''
         console.log("datos",datoConsulta,'bodegas')
        if(datoConsulta.bodega!==''){
          if(datoConsulta.bodega==="BODEGA"){
              invencan="cantidad"
          }else{
           
                    invencan= `cantidad${(Number(datoConsulta.bodega.slice(-1)) + 1).toString()}`;
          }


          if(datoConsulta.linea!==0 && datoConsulta.grupo!==0 ){
                       consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p   `;
      consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')   and codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} order by p.descripcion limit 15`;
    consultotalinventariodes=` select SUM(${invencan}*costo) as totalInventario from productos `
     consultotalinventariodes += ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%') and codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} order by descripcion limit 15`;
          }else if(datoConsulta.linea!==0 ){
              consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p   `;
      consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')  and codigoLinea=${datoConsulta.linea} order by p.descripcion limit 15`;
    consultotalinventariodes=` select SUM(${invencan}*costo) as totalInventario from productos `
     consultotalinventariodes += ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%') and codigoLinea=${datoConsulta.linea} order by descripcion limit 15`;
          }else if( datoConsulta.grupo!==0 ){
                consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p   `;
      consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')   and codigoGrupo=${datoConsulta.grupo} order by p.descripcion limit 15`;
    consultotalinventariodes=` select SUM(${invencan}*costo) as totalInventario from productos `
     consultotalinventariodes += ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%') and  codigoGrupo=${datoConsulta.grupo} order by descripcion limit 15`; 
          }else{
           consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p   `;
      consulta += ` WHERE p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by p.descripcion limit 15`;
    consultotalinventariodes=` select SUM(${invencan}*costo) as totalInventario from productos `
     consultotalinventariodes += ` WHERE descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by descripcion limit 15`;
          }
          
        }else{

           if(datoConsulta.linea!==0 && datoConsulta.grupo!==0 ){

            consulta = `select p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p `;
            consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' )  and codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} order by p.descripcion limit 15`;
              consultotalinventariodes=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos `
       consultotalinventariodes+= ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')  and codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} order by descripcion limit 15`;           
    
          }else if(datoConsulta.linea!==0 ){
          console.log("entro a codigo linea",datoConsulta)
            consulta = `select p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p `;
            consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' )  and codigoLinea=${datoConsulta.linea} order by p.descripcion limit 15`;
              consultotalinventariodes=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos `
       consultotalinventariodes+= ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')  and codigoLinea=${datoConsulta.linea} order by descripcion limit 15`;           
          }else if( datoConsulta.grupo!==0 ){
             
            consulta = `select p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p `;
            consulta += ` WHERE (p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' )  and codigoGrupo=${datoConsulta.grupo} order by p.descripcion limit 15`;
              consultotalinventariodes=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos `
       consultotalinventariodes+= ` WHERE (descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%')  and codigoGrupo=${datoConsulta.grupo} order by descripcion limit 15`;           
          }else{
         consulta = `select p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p   `;
      consulta += ` WHERE p.descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  p.referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR p.codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by p.descripcion limit 15`;
       consultotalinventariodes=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos `
       consultotalinventariodes+= ` WHERE descripcion LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR  referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%'  OR codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' order by descripcion limit 15`;
          }
          
       
    }
           const resumentotaldes= await sequelize
    .query(consultotalinventariodes, { type: sequelize.QueryTypes.SELECT ,logging:true})
     inventariototal=resumentotaldes[0]. totalInventario
      break;


      case "INVENTARIO":
          const inicio =datoConsulta.pagina> 0 ? datoConsulta.pagina * 15 - 15 : 0;
          let consultotalinventario=''
          console.log("bodega seleccionada",datoConsulta.bodega)
          if(datoConsulta.bodega!==''){
            
             if(datoConsulta.bodega==="BODEGA"){
              invencan="cantidad"

          }else {
              invencan= `cantidad${(Number(datoConsulta.bodega.slice(-1)) + 1).toString()}`;
             
          }
              
           if(datoConsulta.linea!==0 && datoConsulta.grupo!==0 ){
                consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p  where codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo}     order by cantidadtotal desc limit ${inicio},15  `;
                       
                  consultotalinventario=` select SUM(${invencan}*costo) as totalInventario from productos where codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} `
           }else if(datoConsulta.linea!==0){
              consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p  where codigoLinea=${datoConsulta.linea}   order by cantidadtotal desc limit ${inicio},15  `;
                       
                  consultotalinventario=` select SUM(${invencan}*costo) as totalInventario from productos where codigoLinea=${datoConsulta.linea} `       
           }else if(datoConsulta.grupo!==0){
              consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p  where codigoGrupo=${datoConsulta.grupo}  order by cantidadtotal desc limit ${inicio},15  `;
                       
                  consultotalinventario=` select SUM(${invencan}*costo) as totalInventario from productos where codigoGrupo=${datoConsulta.grupo} `       
           }else{
              consulta = `select p.*,${invencan} as Cantidad,${invencan}*costo as cantidadtotal from productos   p      order by cantidadtotal desc limit ${inicio},15  `;
                       
                  consultotalinventario=`select SUM(${invencan}*costo) as totalInventario from productos `       
           }
          }else{

             if(datoConsulta.linea!==0 && datoConsulta.grupo!==0 ){


                    consulta = `select p.codigo, p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p   where codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo} order by p.descripcion desc limit ${inicio},15 `;
           consultotalinventario=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos  where codigoLinea=${datoConsulta.linea} and codigoGrupo=${datoConsulta.grupo}`
             
                       
                
           }else if(datoConsulta.linea!==0){
         
                    consulta = `select p.codigo, p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p   where codigoLinea=${datoConsulta.linea} order by p.descripcion desc limit ${inicio},15 `;
           consultotalinventario=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos  where codigoLinea=${datoConsulta.linea}`
                
           }else if(datoConsulta.grupo!==0){
           
                    consulta = `select p.codigo, p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p   where   codigoGrupo=${datoConsulta.grupo} order by p.descripcion desc limit ${inicio},15 `;
           consultotalinventario=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos  where  codigoGrupo=${datoConsulta.grupo}`
           }else{
             consulta = `select p.codigo, p.descripcion,(cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10) as cantidad,p.costo
         ,p.precio1,p.precio2,p.precio3,p.referencia,((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as cantidadtotal from productos   p order by p.descripcion desc limit ${inicio},15    `;
         consultotalinventario=` select SUM((cantidad+cantidad2+cantidad3+cantidad4+cantidad5+cantidad6+cantidad7+cantidad8+cantidad9+cantidad10)*costo) as totalInventario from productos`   
           }
             
          }
                 
        


                    consulta2=`  select count(codigo) as total from productos`
        const resumentotal= await sequelize
    .query(consultotalinventario, { type: sequelize.QueryTypes.SELECT ,logging:true})
     inventariototal=resumentotal[0]. totalInventario
   const re= await sequelize
    .query(consulta2, { type: sequelize.QueryTypes.SELECT ,logging:true})
    console.log("consulta2",resumentotal)
    registro= Math.ceil(re[0].total / 15)
    console.log("registros actuales",registro)
    if(registro===0){
      registro=1
    }


    

      break;
    case "CODIGO":
      consulta += ` WHERE codigoBarra LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR codigo LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' OR referencia LIKE '%${datoConsulta.datoCondicion.toString().trim()}%' limit 1`;
      break;
    case "CODIGO-EQUAL":
      consulta += ` WHERE codigoBarra = '${datoConsulta.datoCondicion.toString()}' OR codigo = '${
        datoConsulta.datoCondicion
      }' OR referencia = '${datoConsulta.datoCondicion.toString()}' limit 1`;
      break;
    default:
      consulta = `SELECT ${cantidad} as cantidad,codigo,descripcion
            ,codigocontable,codigoBarra,referencia,${precioconsulta} as precio,tasaIva,presentacion FROM productos  order by descripcion limit 10`;

      break;
  }

  const { canalUsuario } = datoConsulta;

  sequelize
    .query(consulta, { type: sequelize.QueryTypes.SELECT ,logging:true})
    .then((producto) => {
      ;
      
      if (producto.length > 0) {
        respuesta = {
          sistema: "POS",
          estadoPeticion: "SUCCESS",
          mensajePeticion: producto,
          tipoConsulta: "PRODUCTO",
          canalUsuario: canalUsuario,
          registro,
          inventariototal
        
        };
          
        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      } else {
        ;
        respuesta = {
          sistema: "POS",
          estadoPeticion: "ERROR",
          mensajePeticion: "No se encontró información",
          tipoConsulta: "PRODUCTO",
          canalUsuario: canalUsuario,
        };

        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
        io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      }
    })
    .catch((err) => {
      ;
      ;
      console.log(err)
      respuesta = {
        sistema: "POS",
        estadoPeticion: "ERROR",
        mensajePeticion: err,
        tipoConsulta: "PRODUCTO",
        canalUsuario: canalUsuario,
      };

      io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
      io.emit(process.env.CANALSERVIDOR, JSON.stringify(respuesta));
    })
    .finally(async () => await sequelize.close());
};

productoServicio.actulizar = async (io, db, datoConsulta) => {
  let consulta;
  switch (datoConsulta.condicion.toUpperCase()) {
    case "CANTIDAD":
      // update =`UPDATE productos SET  cantidad${datoConsulta.almacen.slice(-1)}=${datoConsulta.decremento} where codigo=${datoConsulta.codigo}`
      consulta = `SELECT ${
        "cantidad" + datoConsulta.sede.slice(-1)
      },codigo,descripcion
            ,codigocontable,referencia,precio1 FROM productos`;
      break;

    default:
      break;
  }
  //await db.sequelize.query(update,{ type: db.sequelize.QueryTypes.UPDATE})
  
  let resul = await db.sequelize.query(consulta, {
    type: db.sequelize.QueryTypes.SELECT,
    logging:true
  });

  respuesta = {
    estadoPeticion: "SUCCESS",
    mensajePeticion: resul,
  };

  io.emit(datoConsulta.canalserver, respuesta);
};
module.exports = productoServicio;
