const obtenerdbs= async (dbs)=>{
    try {
        let arraydb=[]
        const [results] = await dbs.query("SELECT table_schema FROM information_schema.tables WHERE table_name = 'vendedores'");
        console.log('Bases de datos:');
        results.forEach(db => arraydb=[...arraydb,db]);
        return arraydb
      } catch (error) {
        console.error('Error al listar bases de datos:', error);
      } finally {
        
      }

}

module.exports={
    obtenerdbs
}