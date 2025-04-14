//Carga las variables de entorno el dotenv
require("dotenv").config();

const http = require("http");
const path = require("path");
const dbs = require(path.join(__dirname, "config/db"));
const indexServicio = require(path.join(__dirname, "servicios/index-servicio"));
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const https = require("https");
const { Http2ServerRequest } = require("http2");
const seccion = require("express-session");
const routerauth = require("./routes/auth.routes");
const routerpedido = require("./routes/pedido.routes");
const bdyparse = require("body-parser");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const { obtenerdbs } = require("./libs/obtenerdbs");
const { modeluser } = require("./models/models/usuario");
const { connectDB } = require("./config/dbmongo");
const { dbfiltradas } = require("./libs/dbfiltradas");
const { createConnection } = require("net");
const { crearConexionPorNombre } = require("./libs/dbhelpers");
const { usuarioauth } = require("./controllers/auth.controllers");
const db = require("./config/db");

const MySQLStore = require("express-mysql-session")(seccion);
// hace la conexión al socket servidor en la nube
app = express();

app.use(
  cors({
    origin: "http://localhost:4200", // 👈 origen exacto del frontend
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "img")));
const midlewaraseccion = seccion({
  secret: "fazt", // como va empezar a guardar las secciones
  resave: false, //para que no se empiense a rrenoar la seccion
  saveUninitialized: false, //para que se vuelva a establecer la seccion
  store: new MySQLStore({
    host: process.env.HOST,
    port: process.env.PORTDB,
    user: process.env.USUARIO,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  }), //endonde guardar la seccion
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hora
    sameSite: "lax",
  },
});
app.use(midlewaraseccion);
connectDB();
//app.set('trust proxy', 1);
app.use(routerauth);
app.use(routerpedido);
app.get("/", (req, res) => {
  res.send("Servidor funcionando en Vercel 🚀");
});
app.get("/esteblecerdb/:db", async (req, res) => {
  const { usuario } = req.session;
  req.session.usuario = { ...usuario, db: req.params.db };

  /* const newuserseccion=new modeluser({
   usuario
 })*/
});

app.get("/obtenerdbfiltradas", async (req, res) => {
  const pertenece = await dbfiltradas(dbs, req.session.usuario.documento);

  res.json({ opcionesdb: pertenece });
});

app.get("/selectempresa", async (req, res) => {
  const session = req.session;
  const user = session?.usuario;

  if (user.db) {
    const db = user.db;
    return res.json({ respose: true, db: db, config: user.config });
  } else {
    return res.json({ respose: false });
  }
});

app.get("/verificarvariablesseccion", (req, res) => {
  console.log(req.session.usuario);
  return res.json({ response: true });
});

app.post("/crearinstanciadb", async (req, res) => {
  const { db, user, contrasena } = req.body;

  const { sequelize, usuarioaliasalmacen, vendedor, almacen, usuario } =
    crearConexionPorNombre(db);

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
    console.log(parametro);

    let usuari = await usuarioaliasalmacen.findAll({
      include: [
        {
          model: vendedor,
          attributes: ["identificacion", "codigo"],

          required: true,
        },
        { model: almacen, attributes: ["almacen"], required: true },
      ],
      where: {
        "$vendedor.identificacion$": req.session.usuario.documento, // <-- Aquí va tu filtro
      },
    });

    req.session.usuario = {
      ...req.session.usuario,
      db: db,
      almacen: usuari[0].almacen.almacen,
      config: parametro,
    };

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
      sequelize.close();
      //const resul = await usuarioauth.guardarinstanciadb(req,res);

      return res.status(200).json({ response: true });
      req.session.save(async (err) => {
        if (err) {
          console.error("Error guardando la sesión:", err);
          sequelize.close();
          return res
            .status(500)
            .json({ error: "No se pudo guardar la sesión" });
        }
      });
    } else {
      const newuserseccion = new modeluser({
        documento: req.session.usuario.documento,
        db: db,
      });
      const saveduser = await newuserseccion.save();

      req.session.save(async (err) => {
        if (err) {
          console.error("Error guardando la sesión:", err);
          sequelize.close();
          return res
            .status(500)
            .json({ error: "No se pudo guardar la sesión" });
        }

        sequelize.close();
        //const resul = await usuarioauth.guardarinstanciadb(req,res);
        return res.status(200).json({ response: true });
      });
    }
  } catch (error) {
    console.log(error);
  }
});

const options = {
  key: fs.readFileSync("./miapp.local-key.pem"),
  cert: fs.readFileSync("./miapp.local.pem"),
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://pazzioli-web-90bed.web.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
io.use(wrap(midlewaraseccion));
io.on("connection", (socket) => {
  // Crea el canal al cual escucha
  console.log("usuarioinicio", socket.request.session.usuario);
  socket.on("connect", () => {
    console.log("✅ Socket conectado correctamente");
  });

  socket.on(process.env.CANAL, (data) => {
    const sesion = socket.request.session;
    const usuario = sesion?.usuario;
    if (!usuario) {
      console.log("Usuario no autenticado");
      return socket.disconnect();
    } else {
      if (usuario.db) {
        if (data.metodo === "traeralmacen") {
          socket.emit("obteneralmacen", {
            almacen: socket.request.session.usuario.almacen,
            config: socket.request.session.usuario.config,
          });
        }
      } else {
        console.log("db no definida");
      }
    }
    //Recibe la data y valida que proceso requieren

    switch (data.metodo) {
      case "CREAR":
        indexServicio.crear(socket, dbs, data);
        break;
      case "CONSULTAR":
        console.log("entro aqui");
        indexServicio.consultar(socket, dbs, data);
        break;
      case "ACTULIZAR":
        indexServicio.actulizar(socket, dbs, data);
      default:
        break;
    }
  });

  /* socket.on(process.env.CANALEMAILREGISTRO, (datos) => {
        io.emit(process.env.CANALEMAIL, datos);
    });*/
});
server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("escuchando en puerto 3000");
});
