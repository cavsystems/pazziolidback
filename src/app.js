//Carga las variables de entorno el dotenv
require('dotenv').config();
const http= require('http');
const path = require('path');
const db = require(path.join(__dirname,'config/db'));
const indexServicio = require(path.join(__dirname,'servicios/index-servicio'));
const express=require("express");
const fs = require('fs');
const cors= require('cors');
const https = require('https');
const { Http2ServerRequest } = require('http2');
const seccion=require('express-session')
const routerauth=require('./routes/auth.routes')
const bdyparse=require('body-parser')
const { Server } = require("socket.io"); 
const bodyParser = require('body-parser');
const MySQLStore = require('express-mysql-session')(seccion)
// hace la conexión al socket servidor en la nube
app=express()


app.use(cors({ origin: "https://pazzioli-web-90bed.web.app", // 👈 origen exacto del frontend
  credentials: true } ))
app.use(bodyParser.json())
app.use(seccion({
  secret: 'fazt',// como va empezar a guardar las secciones
  resave: false,//para que no se empiense a rrenoar la seccion
  saveUninitialized: false,//para que se vuelva a establecer la seccion
  store: new MySQLStore({
    host:process.env.HOST,
    port:process.env.PORTDB,
    user:process.env.USUARIO,
    password:process.env.PASSWORD,
    database: process.env.DATABASE
  })  ,//endonde guardar la seccion
  cookie: {
    httpOnly:false,
    maxAge: 1000 * 60 * 60, // 1 hora
    secure: true, // true si usas HTTPS
    sameSite: 'None',
  }
}));
app.get("/", (req, res) => {
  res.send("Servidor funcionando en Vercel 🚀");
});
  app.use(routerauth)
  const options = {
    key: fs.readFileSync('./miapp.local-key.pem'),
    cert: fs.readFileSync('./miapp.local.pem')
  };

  const server=http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
  io.use(wrap(seccion({
    secret: 'fazt',// como va empezar a guardar las secciones
    resave: false,//para que no se empiense a rrenoar la seccion
    saveUninitialized: false,//para que se vuelva a establecer la seccion
    store: new MySQLStore({
      host:process.env.HOST,
      port:process.env.PORTDB,
      user:process.env.USUARIO,
      password:process.env.PASSWORD,
      database: process.env.DATABASE
    })  ,//endonde guardar la seccion
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hora
      sameSite: 'None',
      secure: true // true si usas HTTPS
    }
  })));
io.on('connection', (socket) => {
  // Crea el canal al cual escucha
  socket.on("connect", () => {
    console.log("✅ Socket conectado correctamente");
  });
socket.on(process.env.CANAL, (data) => {
  const sesion = socket.request.session;
  const usuario = sesion?.usuario;
  if (!usuario) {
    console.log("Usuario no autenticado");
    return socket.disconnect();
  }
     
    //Recibe la data y valida que proceso requieren
   
    switch (data.metodo) {
        case 'CREAR':
            indexServicio.crear(socket, db, data);
            break;
        case 'CONSULTAR':
            console.log("entro aqui")
            indexServicio.consultar(socket, db, data);
            break;
        case 'ACTULIZAR':
            indexServicio.actulizar(socket,db,data)
        default:
            break;
    }
});
   
   /* socket.on(process.env.CANALEMAILREGISTRO, (datos) => {
        io.emit(process.env.CANALEMAIL, datos);
    });*/
});
server.listen(process.env.PORT || 3000,'0.0.0.0',()=>{
  console.log("escuchando en puerto 3000")
})

