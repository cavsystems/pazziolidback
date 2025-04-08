

module.exports=(sequelize)=>{
    const {DataTypes}=require('sequelize')
    const usuarioaliasalmacen=sequelize.define('usuarioaliasalmacen', {
        codigo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        codigoUsuario:{
            type:DataTypes.INTEGER
        },
        codigoAliasAlmacen:{
            type:DataTypes.INTEGER
        }
      
      
       
    },{
        tableName: 'usuariosaliasalmacen', 
        timestamps: false,
    });
    
    
      return usuarioaliasalmacen  
}