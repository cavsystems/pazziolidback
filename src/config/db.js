const {Sequelize,DataTypes} = require('sequelize');
const { getNombre } = require('../libs/nombredasedatos');

const db = {};

// Opciones de conexión a la base de datos con Sequelize
const opciones = {
    host: process.env.HOST,
    dialect: process.env.DIALECT || 'mysql',
    port: process.env.PORTDB || 3306,
  
}

//Conexion a la base de datos por ORM Sequelize
const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USUARIO,
    process.env.PASSWORD,
    opciones
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.DataType=DataTypes

module.exports = db;