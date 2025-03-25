const {sequelize,DataType} =require("../config/db");
const { almacen } = require("./almacen");
const { vendedor } = require("./vendedor-model");
const usuarioaliasalmacen=sequelize.define('usuarioaliasalmacen', {
    codigo: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    codigoUsuario:{
        type:DataType.INTEGER
    },
    codigoAliasAlmacen:{
        type:DataType.INTEGER
    }
  
  
   
},{
    tableName: 'usuariosaliasalmacen',
    timestamps: false,
});

// 👇 Aquí defines que usuarioaliasalmacen pertenece a vendedor por el campo codigoUsuario
usuarioaliasalmacen.belongsTo(vendedor, {
    foreignKey: 'codigoUsuario'
  });
  
  // 👇 Y que pertenece a almacen por el campo codigoAliasAlmacen
  usuarioaliasalmacen.belongsTo(almacen, {
    foreignKey: 'codigoAliasAlmacen'
  });
module.exports={
    usuarioaliasalmacen
}