//Carga las variables de entorno el dotenv
require('dotenv').config();
const http= require('http');
const path = require('path');
const io = require('socket.io');
const db = require(path.join(__dirname,'config/db'));
const indexServicio = require(path.join(__dirname,'servicios/index-servicio'));
const express=require("express");
const cors        = require('cors');
const { Http2ServerRequest } = require('http2');
// hace la conexión al socket servidor en la nube

const app=express()
app.use(cors())

const server=http.Server(app, {
    cors: {
      origin: "*", // Ajusta según sea necesario
      methods: ["GET", "POST"]
    }
  })
  server.listen(4000,()=>{
    console.log("escuchando en el puerto 4000")
  })
const socket = io(server);
socket.on('connection', (socket) => {
  // Crea el canal al cual escucha
  socket.on("connect", () => {
    console.log("✅ Socket conectado correctamente");
  });
socket.on(process.env.CANAL, (data) => {
    
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
