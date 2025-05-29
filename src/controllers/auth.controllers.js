const { creartokenvendedor } = require("../libs/jwt");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const dbs = require("../config/db");
const jwt = require("jsonwebtoken");
const { dbfiltradas } = require("../libs/dbfiltradas");
const { modeluser } = require("../models/models/usuario");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { where } = require("sequelize");
dayjs.extend(utc);
dayjs.extend(timezone);
class Useraccioneauth {
  constructor() {
    this.login = this.login.bind(this);
    this.verificarauth = this.verificarauth.bind(this);
    this.logout = this.logout.bind(this);
    this.destruir = this.destruir.bind(this);
    this.guardarinstanciadb = this.guardarinstanciadb.bind(this);
    this.obtenerpreciopredeterminado =
      this.obtenerpreciopredeterminado.bind(this);
  }
  async login(req, res) {
    const { user, documento, password, db } = req.body;
    if (db === null || db === "" || !db) {
      return res.json({
        autenticado: false,
        mensaje: "Selecciona una organización",
      });
    }
    if (documento.length < 8) {
      return res.status(401).json({
        autenticado: false,
        mensaje: "Numero de identificacion muy corto",
      });
    }
    const { sequelize, usuarioaliasalmacen, almacen, usuarios, vendedor } =
      crearConexionPorNombre(db);
    let consulta = "select * from vendedores where identificacion=?";
    const [vendedoruser] = await sequelize.query(consulta, {
      replacements: [documento],
    });

    if (vendedoruser.length > 0) {
      consulta = "select * from usuario where login=?";
      const [usuario] = await sequelize.query(consulta, {
        replacements: [user],
      });
      if (usuario.length > 0) {
        if (usuario[0].password === password) {
          const [result] = await sequelize.query(
            "SELECT pc.* FROM parametroscomprobante pc JOIN parametros p ON pc.codigoParametro = p.codigo JOIN usuarioscomprobantes uc ON pc.codigoComprobante = uc.codigoComprobante WHERE p.nombre LIKE ? AND uc.codigoUsuario =? AND uc.categoria =?;",
            {
              replacements: [
                "%VENDEDOR_PREDETERMINADO%",
                usuario[0].codigo,
                "VENTAS",
              ],
            }
          );
          if (result.length > 0) {
            const [result2] = await sequelize.query(
              "SELECT * FROM sesiones where codigoUsuario=? AND estado=?;",
              {
                replacements: [usuario[0].codigo, "ACTIVO"],
              }
            );
            if (result2.length > 0) {
              req.session.usuario = {
                codigousuario: usuario[0].codigo,
                db: db,
              };
              return res.status(401).json({
                autenticado: true,
                mensaje: "Sesión activa en otro dispositivo desea cerrarla",
                opcion: true,
              });
            } else {
              await sequelize.query(
                "insert into sesiones(codigo,codigousuario,estado,fechaInicio,fechaFin)values(0,?,'ACTIVO',CURRENT_TIMESTAMP,'1990-01-01 00:00:00')",
                { replacements: [usuario[0].codigo] }
              );
              const [fechai] = await sequelize.query(
                "SELECT * FROM sesiones where codigoUsuario=? AND estado=?;",
                {
                  replacements: [usuario[0].codigo, "ACTIVO"],
                }
              );
              const fecha = fechai[0].fechaInicio;
              let usuarioauth = await usuarioaliasalmacen.findAll({
                include: [
                  {
                    model: usuarios,
                    attributes: ["codigo", "nombre"],

                    required: true,
                  },
                  {
                    model: almacen,
                    attributes: ["almacen", "alias"],
                    required: true,
                  },
                ],
                where: {
                  "$usuario.codigo$": usuario[0].codigo, // <-- Aquí va tu filtro
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
              if (usuarioauth.length <= 0) {
                return res.status(401).json({
                  autenticado: false,
                  mensaje: "Usuario no relacionado con ningun almacen",
                });
              }
              try {
                const parametro = await parametros;
                const precio = await this.obtenerpreciopredeterminado(
                  usuario[0].codigo,
                  sequelize
                );
                req.session.usuario = {
                  documento: documento,
                  db: db,
                  almacen: usuarioauth[0].almacen.almacen,
                  vendedor: vendedoruser[0].nombre,
                  config: parametro,
                  codigousuario: usuario[0].codigo,
                  nombre: usuario[0].nombre,
                  alias: usuarioauth[0].almacen.alias,
                  fecha: fecha,
                  precio,
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
              .status(401)
              .json({ autenticado: false, mensaje: "Vendedor no asociado" });
          }
        }
      } else {
        return res
          .status(400)
          .json({ autenticado: false, mensaje: "Credenciales incorrectas" });
      }
    }
    return res
      .status(400)
      .json({ autenticado: false, mensaje: "Usuario no existe" });
  }

  async verificarauth(req, res) {
    const { usuario } = req.session;

    if (usuario) {
      if (!usuario.documento) {
        return res.json({ response: false });
      }
      const { sequelize } = crearConexionPorNombre(usuario.db);
      const [logiado] = await sequelize.query(
        "SELECT * FROM sesiones where codigoUsuario=? AND estado=? limit 1;",
        { replacements: [usuario.codigousuario, "ACTIVO"] }
      );

      if (logiado.length > 0) {
        if (
          new Date(logiado[0].fechaInicio).getTime() !==
          new Date(usuario.fecha).getTime()
        ) {
          req.session.destroy(async (err) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "No se pudo cerrar la sesión" });
            }

            res.clearCookie("connect.sid");

            return res.status(200).json({
              message: "Sesión cerrada correctamente",
              response: false,
            });
          });
        } else {
          return res.json({ response: true });
        }
      } else {
        req.session.destroy(async (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "No se pudo cerrar la sesión" });
          }

          res.clearCookie("connect.sid");

          return res.status(200).json({
            message: "Sesión cerrada correctamente",
            response: false,
          });
        });
      }
    } else {
      return res.json({ response: false });
    }
  }

  async logout(req, res) {
    console.log(req.session.usuario);
    console.log("entro a deslogguiarse");
    console.log(req.session);
    if (req.session.usuario) {
      const saveduser = await modeluser.findOneAndUpdate(
        { documento: req.session.usuario.documento },
        { $set: { db: "" } },
        { new: true }
      );
    }

    if (req.session) {
      if (req.session.usuario) {
        const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
        // Opcional: limpiar la cookie de sesión en el cliente
        const [resul] = await sequelize.query(
          "update sesiones set estado='CERRADO' where codigoUsuario=?",
          {
            replacements: [req.session.usuario.codigousuario],
          }
        );
      }
    }

    req.session.destroy(async (err) => {
      if (err) {
        return res.status(500).json({ error: "No se pudo cerrar la sesión" });
      }

      res.clearCookie("connect.sid");

      return res.json({
        message: "Sesión cerrada correctamente",
        response: false,
      });
    });
  }

  async destruir(req, res) {
    if (req.session.usuario) {
      const saveduser = await modeluser.findOneAndUpdate(
        { documento: req.session.usuario.documento },
        { $set: { db: "" } },
        { new: true }
      );
    }

    if (req.session) {
      if (req.session.usuario) {
        const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
        // Opcional: limpiar la cookie de sesión en el cliente
        const [resul] = await sequelize.query(
          "update sesiones set estado='CERRADO' where codigoUsuario=?",
          {
            replacements: [req.session.usuario.codigousuario],
          }
        );
      }
    }

    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          resolve(true); // error al destruir
        } else {
          res.clearCookie("connect.sid");
          resolve(false); // destruido correctamente
        }
      });
    });
  }

  async guardarinstanciadb(req, res) {
    const { db, user, contrasena } = req.body;
    const { sequelize, usuario } = crearConexionPorNombre(db);

    const usu = await usuario.findOne({
      where: {
        login: user,
      },
    });
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
    const userfund = await modeluser.find({
      documento: req.session.usuario.documento,
    });

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

  async obtenerpreciopredeterminado(codigousuario, sequelize) {
    const [result] = await sequelize.query(
      "SELECT pc.* FROM parametroscomprobante pc JOIN parametros p ON pc.codigoParametro = p.codigo JOIN usuarioscomprobantes uc ON pc.codigoComprobante = uc.codigoComprobante WHERE p.nombre LIKE ? AND uc.codigoUsuario =? AND uc.categoria =?;",
      {
        replacements: ["%LISTA_PREDETERMINADA%", codigousuario, "VENTAS"],
      }
    );
    console.log(result);

    if (result.length <= 0) {
      return 1;
    }
    if (
      Number(result[0].valor) === 1 ||
      Number(result[0].valor) === 2 ||
      Number(result[0].valor) === 3 ||
      Number(result[0].valor) === 4
    ) {
      return Number(result[0].valor);
    } else {
      return 1;
    }
  }
}

module.exports = {
  usuarioauth: new Useraccioneauth(),
};
