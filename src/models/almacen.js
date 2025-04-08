
module.exports=(sequelize)=>{
    const {DataTypes}=require('sequelize')
    const almacen=sequelize.define('almacen', {
        codigo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        almacen: {
            type: DataTypes.STRING,
           
        },
        alias: {
            type: DataTypes.STRING,
           
        },
      
       
    },{
        tableName: 'aliasalmacen',
        timestamps: false,
    });
    return almacen
}