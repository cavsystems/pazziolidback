const {sequelize,DataType} =require("../config/db");
const usuario=sequelize.define('usuario', {
    codigo: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataType.STRING,
       
    },
    password: {
        type: DataType.STRING,
       
    },
    login: {
        type: DataType.STRING,
       
    },
    login: {
        type: DataType.INTEGER,
       
    },
    estado: {
        type:DataType.STRING,
        defaultValue:"ACTIVO",
    }
},{
    tableName: 'usuario',
    timestamps: false,
});
module.exports={
    usuario
}