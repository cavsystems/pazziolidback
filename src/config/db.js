const Sequelize = require('sequelize');

const db = {};

// Opciones de conexión a la base de datos con Sequelize
const opciones = {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    port: process.env.PORTDB
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

module.exports = db;