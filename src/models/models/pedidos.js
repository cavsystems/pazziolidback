const mongoose = require("mongoose");
const clienteschema = new mongoose.Schema({
  celulares: {
    type: String,
  },
  codigo: {
    type: Number,
  },
  direccion: {
    type: String,
  },
  email: {
    type: String,
  },
  identificacion: {
    type: String,
  },
  nombre: {
    type: String,
  },
  telefonoFijo: {
    type: String,
  },
  plazo:{
    type:Number,
  }
});

const pedido = new mongoose.Schema({
  cantidad: { type: Number },

  codigo: {
    type: Number,
  },

  codigobarra: {
    type: String,
  },

  nombre: {
    type: String,
  },

  numero: {
    type: Number,
  },

  precio: {
    type: Number,
  },

  referencia: {
    type: String,
  },
  tasaiva: {
    type: Number,
  },

  total: {
    type: Number,
  },
  presentacion: {
    type: String,
  },
  codigoContable: {
    type: String,
  },
  costo:{
    type:Number,
  },
  codigoGrupo:{
    type:Number
  },
  
codigoLinea:{
  type:Number

},

costoPromedio:{
  type:Number
}



});

const pedidoreservado = new mongoose.Schema(
  {
    vendedor: {
      type: String,
    },
    cliente: clienteschema,
    productos_pedido: [pedido],
  },
  { timestamps: true }
);

const modelpedidoreservado = mongoose.model("pedidoreservado", pedidoreservado);

module.exports = {
  modelpedidoreservado,
};
