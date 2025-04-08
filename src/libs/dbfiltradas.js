const { obtenerdbs } = require("./obtenerdbs");
const { nombredb,getNombre } = require("./nombredasedatos");
const { crearConexionPorNombre } = require('./dbhelpers');
const dbfiltradas= async (dbs,documento)=>{
     let arraydb=[]
          let pertenece=[]
          console.log(documento)
         
           const result=await dbs.sequelize.query(`CALL BuscarIdentificacion(?)`,{
            replacements:[documento],
          
           })

           if(result.length>0){
            return result

           }
         /*  arraydb= await obtenerdbs(dbs.sequelize)
           if(arraydb.length>0){
               let consulta=""
              arraydb.map((db,index)=>{
                console.log(db)
               consulta+=`SELECT '${db.TABLE_SCHEMA}' as nombredb,identificacion FROM ${db.TABLE_SCHEMA}.vendedores WHERE identificacion = ? `
               if(index!==arraydb.length-1){
                 consulta+=" "+"UNION ALL" +" "
               }

              })
              
             
             // Crea un array de tamaño arraydb.length (la cantidad de bases de datos).

              //Llena cada posición del array con el valor de documento.
              const replacements = Array(arraydb.length).fill(documento);
              const [results] = await dbs.sequelize.query(consulta, {
                replacements
              });

              
              
              return results
           }else{
            return []
           }*/
          return []

        /*    await Promise.all(arraydb.map( async (db)=>{
           
            const query = `
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = ? AND table_name = ?
            LIMIT 1
          `;
        
          const [results] = await dbs.sequelize.query(query, {
            replacements: [db.Database,'vendedores']
          });
            if(results[0].count>0){
              
               
               const { usuarioaliasalmacen, vendedor, almacen } = crearConexionPorNombre(db.Database);
              
               //realisacion de un join para encontrar los usuarios con su respectivo almacen
               let usuari=await usuarioaliasalmacen.findAll({
                include:[
                  {model:vendedor,
                  attributes:['identificacion','codigo'],
                 
                  required: true 
        
                }
                ,
                  {model:almacen,
                  attributes:['almacen'],
                  required: true 
                }
        
               ],
               where: {
                '$vendedor.identificacion$':documento// <-- Aquí va tu filtro
               },
              
              }
           
               );
               usuari=usuari.map(u=>u.toJSON())
               if(usuari.length>0){
                  pertenece.push(db.Database)
               }
            }
    
           }))*/


}

module.exports={
    dbfiltradas
}