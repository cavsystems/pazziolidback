const { modeltercero } = require("../models/models/tercero");

class tercero {
  constructor() {}

  async guardartercero(req, res) {
    let id;

    try {
      const cliente = await modeltercero.find({
        vendedor: req.session.usuario.documento,
      });

      if (cliente.length > 0) {
        const data = { ...req.body, vendedor: req.session.usuario.documento };

        const updatedcliente = await modeltercero.findByIdAndUpdate(
          cliente[0]._id.toString(),
          { $set: data },
          { new: true }
        );

        console.log(updatedcliente);
        return res
          .status(200)
          .json({ mensaje: "cliente actulizado", response: true });
      } else {
        const data = { ...req.body, vendedor: req.session.usuario.documento };
        const tercero = new modeltercero(data);
        await tercero.save();

        return res
          .status(200)
          .json({ mensaje: "cliente guardado", response: true });
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        mensaje: "error a lahora de guardar el cliente error en el servidor",
        response: true,
      });
    }
  }

  async obtenercliente(req, res) {
    const cliente = await modeltercero
      .findOne({
        vendedor: req.session.usuario.documento,
      })
      .lean();

    return res.status(200).json({ response: true, datos: cliente });
  }

  async eliminarcliente(req, res) {
    // console.log(req.params.id);
    if (!req.params.id) {
      return res
        .status(404)
        .json({ response: false, message: "id no proporcionado" });
    }
    const result = await modeltercero.findByIdAndDelete(req.params.id);

    if (!result) {
      return res
        .status(404)
        .json({ response: false, message: "Cliente no encontrado" });
    }

    return res
      .status(200)
      .json({ response: true, message: "Cliente eliminado correctamente" });
  }
}

module.exports = {
  tercerocontrollers: new tercero(),
};
