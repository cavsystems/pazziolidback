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
const routerterceo = require("./routes/tercero.routes");
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
const { midleware } = require("./libs/midleware");

const MySQLStore = require("express-mysql-session")(seccion);
// hace la conexión al socket servidor en la nube
app = express();

app.use(
  cors({
    origin: `${process.env.local}`, // 👈 origen exacto del frontend
    credentials: true,
  })
);
app.use(express.json());
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
  //http es para que cookie se accesible desde document.cookie
  cookie: {
    sameSite: "lax", // ⬅️ obligatorio si tu frontend y backend están en dominios distintos
    // secure: true, // ⬅️ obligatorio para que se envíe por HTTPS
    httpOnly: true, // ⬅️ recomendado para seguridad (aunque puedes poner false si necesitas leerla en JS)
  },
});

app.use(midlewaraseccion);
connectDB();
//app.set('trust proxy', 1);
app.get("/api", (req, res) => {
  res.send("Servidor funcionando en Vercel 🚀");
});
app.use("/api", routerauth);
app.get("/api/traerempresas", async (req, res) => {
  try {
    const { documento } = req.query;
    if (!/^\d*$/.test(documento)) {
      let datos = await dbs.sequelize.query(
        "call BuscarEmpresaPorVendedor(?)",
        {
          replacements: [documento],
          type: dbs.sequelize.QueryTypes.SELECT,
        }
      );
      //toma un objeto y devuelve un array con los valores de sus propiedades
      datos = Object.values(datos[0]);

      res.json({ response: true, data: datos });
    } else {
      res.json({ response: true, data: [] });
    }
  } catch (error) {
    res.json({
      response: false,
      message: "ocurrio un error al ejecutar el procedimiento",
    });
  }
});

app.use("/api", midleware, routerpedido);
app.use("/api", midleware, routerterceo);

app.get("/api/esteblecerdb/:db", midleware, async (req, res) => {
  const { usuario } = req.session;
  req.session.usuario = { ...usuario, db: req.params.db };

  /* const newuserseccion=new modeluser({
   usuario
 })*/
});

app.get("/api/obtenerdbfiltradas", midleware, async (req, res) => {
  const pertenece = await dbfiltradas(dbs, req.session.usuario.documento);

  res.json({ opcionesdb: pertenece });
});

app.get("/api/selectempresa", midleware, async (req, res) => {
  const session = req.session;
  const user = session?.usuario;

  if (user?.db) {
    if (!user?.documento) {
      return res.json({
        response: false,
      });
    }
    const db = user.db;
    return res.json({
      response: true,
      db: db,
      config: user.config,
      alias: user.alias,
      nombre: user.vendedor,
      identificacion: user.documento,
      nombreusuario: user.nombre,
    });
  } else {
    return res.json({
      response: false,
      mensaje: "no hay empresa seleccionada",
    });
  }
});

app.get("/api/verificarvariablesseccion", midleware, (req, res) => {
  return res.json({ response: true });
});

const options = {
  key: fs.readFileSync("./miapp.local-key.pem"),
  cert: fs.readFileSync("./miapp.local.pem"),
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://pazziolweb.cavsystems.com.co",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
io.use(wrap(midlewaraseccion));
io.on("connection", (socket) => {
  // Crea el canal al cual escucha
  socket.on("connect", () => {});

  socket.on(process.env.CANAL, (data) => {
    const sesion = socket.request.session;
    const usuario = sesion?.usuario;
    if (!usuario) {
      console.log("el error fue aqui");
      return socket.disconnect();
    } else {
      if (!usuario.documento) {
        console.log("el error fue aqui");
        return socket.disconnect();
      }
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
      }
    }
    //Recibe la data y valida que proceso requieren

    switch (data.metodo) {
      case "CREAR":
        indexServicio.crear(socket, dbs, data);
        break;
      case "CONSULTAR":
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
  console.log("escuchando en el puerto 3000");
});
