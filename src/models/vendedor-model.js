const {sequelize,DataType} =require("../config/db");
const vendedor=sequelize.define('vendedor', {
    codigo: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    identificacion: {
        type: DataType.STRING,
       
    },
    nombre: {
        type: DataType.STRING,
       
    },
    direccion: {
        type: DataType.STRING,
       
    },
    telefono: {
        type: DataType.INTEGER,
       
    }
   
},{
    tableName: 'vendedores',
    timestamps: false,
});
module.exports={
    vendedor
}