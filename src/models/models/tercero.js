const mongoose = require("mongoose");
const cliente = new mongoose.Schema({
  identificacion: {
    type: String,
    required: true,
    trim: true,
  },
  razonSocial: {
    type: String,
  },
  telefonoFijo: {
    type: String,
  },
  email: {
    type: String,
  },
  celulares: {
    type: String,
  },
  direccion: {
    type: String,
  },
  codigo: {
    type: Number,
  },
  imagen: {
    type: String,
  },
  municipio: {
    type: String,
  },
  vendedor: {
    type: String,
    required: true,
    unique: true,
  },
});
const modeltercero = mongoose.model("cliente", cliente);
module.exports = {
  modeltercero,
};
