const { creartokenvendedor } = require("../libs/jwt");
const path = require("path");
const dbs = require("../config/db");
const jwt = require("jsonwebtoken");
const { dbfiltradas } = require("../libs/dbfiltradas");
const { modeluser } = require("../models/models/usuario");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { where } = require("sequelize");
class Useraccioneauth {
  constructor() {}
  async login(req, res) {
    const { user, documento, password, db } = req.body;
    if (db === null || db === "" || !db) {
      return res.json({
        autenticado: false,
        mensaje: "selecciona una organizacion",
      });
    }
    const { sequelize, usuarioaliasalmacen, almacen, usuario, vendedor } =
      crearConexionPorNombre(db);
    let consulta = "select * from vendedores where identificacion=?";
    const [vendedoruser] = await sequelize.query(consulta, {
      replacements: [documento],
    });
    console.log(vendedoruser);

    if (vendedoruser.length > 0) {
      consulta = "select * from usuario where login=?";
      const [usuario] = await sequelize.query(consulta, {
        replacements: [user],
      });
      if (usuario.length > 0) {
        if (usuario[0].password === password) {
          let usuarioauth = await usuarioaliasalmacen.findAll({
            include: [
              {
                model: vendedor,
                attributes: ["identificacion", "codigo", "nombre"],

                required: true,
              },
              {
                model: almacen,
                attributes: ["almacen", "alias"],
                required: true,
              },
            ],
            where: {
              "$vendedor.identificacion$": documento, // <-- Aquí va tu filtro
            },
          });

          const parametros = new Promise(async (resolve, reject) => {
            let parametros = {};
            try {
              const resul = await sequelize.query(
                "select nombre,valor from parametrosglobales p inner join parametros r on r.codigo=p.codigoParametroGlobal",
                {
                  type: sequelize.QueryTypes.SELECT,
                }
              );

              resul.map((item) => {
                parametros = { [item.nombre]: item.valor, ...parametros };
              });
              resolve(parametros);
            } catch (error) {
              reject({ message: "error inesperado", error: error });
            }
          });
          try {
            const parametro = await parametros;
            req.session.usuario = {
              documento: documento,
              db: db,
              almacen: usuarioauth[0].almacen.almacen,
              vendedor: usuarioauth[0].vendedor.nombre,
              config: parametro,
              alias: usuarioauth[0].almacen.alias,
            };
            return res.json({ autenticado: true });
          } catch (error) {
            console.log(error);
            return res.status(400).json({
              autenticado: false,
              mensaje: "error de servidor",
              error,
            });
          }
        }
      } else {
        return res
          .status(400)
          .json({ autenticado: false, mensaje: "contraseña incorecta" });
      }
    }
    return res
      .status(400)
      .json({ autenticado: false, mensaje: "usuario no existe" });
  }

  verificarauth(req, res) {
    const { usuario } = req.session;

    if (usuario) {
      res.json({ response: true });
    } else {
      res.json({ response: false });
    }
  }

  async logout(req, res) {
    if (req.session.usuario) {
      const saveduser = await modeluser.findOneAndUpdate(
        { documento: req.session.usuario.documento },
        { $set: { db: "" } },
        { new: true }
      );
    }

    req.session.destroy(async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "No se pudo cerrar la sesión" });
      }
      // Opcional: limpiar la cookie de sesión en el cliente
      res.clearCookie("connect.sid");

      return res.json({ message: "Sesión cerrada correctamente" });
    });
  }

  async guardarinstanciadb(req, res) {
    const { db, user, contrasena } = req.body;
    console.log(req.body);
    const { sequelize, usuario } = crearConexionPorNombre(db);

    const usu = await usuario.findOne({
      where: {
        login: user,
      },
    });
    console.log(usu);
    //con get con el parametro plain obtengo los datos obtenidos sin metadatos
    if (!usu) {
      return res
        .status(400)
        .json({ response: false, error: "usuario de caja no existe " });
    }
    if (usu.estado !== "ACTIVO") {
      return res.status(400).json({
        response: false,
        error: "este usuario de caja se encuentra inactivo",
      });
    }
    if (usu.password !== contrasena) {
      return res.status(400).json({
        response: false,
        error: "contraseña incorrecta intenta de nuevo",
      });
    }
    console.log(usu.get({ plain: true }));
    const userfund = await modeluser.find({
      documento: req.session.usuario.documento,
    });
    console.log(userfund);

    if (userfund.length > 0) {
      const saveduser = await modeluser.findOneAndUpdate(
        { documento: req.session.usuario.documento },
        { $set: { db: db } },
        { new: true }
      );
      return res.status(200).json({ response: true });
    } else {
      const newuserseccion = new modeluser({
        documento: req.session.usuario.documento,
        db: db,
      });
      const saveduser = await newuserseccion.save();

      return res.status(200).json({ response: true });
    }
  }
}

module.exports = {
  usuarioauth: new Useraccioneauth(),
};
