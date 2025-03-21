//Carga las variables de entorno el dotenv
require('dotenv').config();
const http= require('http');
const path = require('path');
const db = require(path.join(__dirname,'config/db'));
const indexServicio = require(path.join(__dirname,'servicios/index-servicio'));
const express=require("express");

const cors= require('cors');

const { Http2ServerRequest } = require('http2');
const routerauth=require('./routes/auth.routes')
const { Server } = require("socket.io"); 
// hace la conexión al socket servidor en la nube
app=express()


app.use(cors({ origin: "*" }))
app.use(express.json())
app.get("/", (req, res) => {
  res.send("Servidor funcionando en Vercel 🚀");
});
  app.use(routerauth)


  const server=http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
io.on('connection', (socket) => {
  // Crea el canal al cual escucha
  socket.on("connect", () => {
    console.log("✅ Socket conectado correctamente");
  });
socket.on(process.env.CANAL, (data) => {
  const token = socket.handshake.auth?.token;
   
     
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

