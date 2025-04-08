const {sequelize,DataType} =require("../config/db");

module.exports=(sequelize)=>{
    const {DataTypes}=require('sequelize')
    const usuario=sequelize.define('usuario', {
        codigo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
           
        },
        password: {
            type: DataTypes.STRING,
           
        },
        login: {
            type: DataTypes.STRING,
           
        },
        login: {
            type: DataTypes.INTEGER,
           
        },
        estado: {
            type:DataTypes.STRING,
            defaultValue:"ACTIVO",
        }
    },{
        tableName: 'usuario',
        timestamps: false,
    });
    return usuario
}