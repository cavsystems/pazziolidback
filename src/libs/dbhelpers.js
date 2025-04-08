const { Sequelize, DataTypes } = require('sequelize');
//me retorna una instancia de una conexion squlize con todos sus modelos
const crearConexionPorNombre = (nombreDB) => {
  const sequelize = new Sequelize(
    nombreDB,
    process.env.USUARIO,
    process.env.PASSWORD,
    {
      host: process.env.HOST,
      dialect: 'mysql',
      port: process.env.PORTDB || 3306,
      logging: false
    }
  );

  const models = {
    sequelize,
    usuarioaliasalmacen: require('../models/usuarioaliasalmacen')(sequelize),
    vendedor: require('../models/vendedor-model')(sequelize),
    almacen: require('../models/almacen')(sequelize),
    usuario:require('../models/user-model')(sequelize)
  };

  // Si hay relaciones entre modelos, aquí puedes definirlas
   // 👇 Aquí defines que usuarioaliasalmacen pertenece a vendedor por el campo codigoUsuario
  models.usuarioaliasalmacen.belongsTo(models.vendedor, { foreignKey: 'codigoUsuario' });
     // 👇 Y que pertenece a almacen por el campo codigoAliasAlmacen
  models.usuarioaliasalmacen.belongsTo(models.almacen, { foreignKey: 'codigoAliasAlmacen' });

  return models;
};

module.exports = { crearConexionPorNombre };
