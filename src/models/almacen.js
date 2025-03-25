const {sequelize,DataType} =require("../config/db");
const almacen=sequelize.define('almacen', {
    codigo: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    almacen: {
        type: DataType.STRING,
       
    },
    alias: {
        type: DataType.STRING,
       
    },
  
   
},{
    tableName: 'aliasalmacen',
    timestamps: false,
});
module.exports={
    almacen
}