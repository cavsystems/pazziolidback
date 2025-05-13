module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const vendedor = sequelize.define(
    "vendedor",
    {
      codigo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      identificacion: {
        type: DataTypes.STRING,
      },
      nombre: {
        type: DataTypes.STRING,
      },
      direccion: {
        type: DataTypes.STRING,
      },
      telefono: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "vendedores",
      timestamps: false,
    }
  );
  return vendedor;
};
