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
const { enviarDataEmail } = require("./servicios/servicio-email");

const MySQLStore = require("express-mysql-session")(seccion);
// hace la conexión al socket servidor en la nube
app = express();

app.use(
  cors({
    origin: `${process.env.local}`, // 👈 origen exacto del frontend
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
    sameSite: "lax",
  },
});
app.use(midlewaraseccion);
connectDB();
//app.set('trust proxy', 1);
app.use(routerauth);
app.get("/traerempresas", async (req, res) => {
  try {
    let datos = await dbs.sequelize.query("call Buscarempresa()", {
      type: dbs.sequelize.QueryTypes.SELECT,
    });
    //toma un objeto y devuelve un array con los valores de sus propiedades
    datos = Object.values(datos[0]);
    console.log(datos);
    res.json({ response: true, data: datos });
  } catch (error) {
    res.json({
      response: false,
      message: "ocurrio un error al ejecutar el procedimiento",
    });
  }
});
app.use((req, res, next) => {
  console.log("token valido en espera ", req.session);
  if (!req.session?.usuario) {
    return res.json({ response: false, mensaje: "token invalido" });
  }
  next();
});
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
    return res.json({
      response: true,
      db: db,
      config: user.config,
      alias: user.alias,
      nombre: user.vendedor,
      identificacion: user.documento,
    });
  } else {
    console.log("no hay db");
    return res.json({
      response: false,
      mensaje: "no hay empresa seleccionada",
    });
  }
});

app.get("/verificarvariablesseccion", (req, res) => {
  console.log(req.session.usuario);
  return res.json({ response: true });
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

            nombre: socket.request.session.usuario.vendedor,
            identificacion: socket.request.session.usuario.documento,
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
      case "EMAIL":
        enviarDataEmail(socket, data);
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
