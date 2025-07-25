const { generarTirillaPDF } = require("../libs/generarpdftirilla");
const { crearcorreo } = require("../libs/instanciacorreo");
async function enviarDataEmail(io, data) {
  const pdfBuffer = await generarTirillaPDF(
    io.request.session.usuario,
    data.data.itemspedido,
    data.data.idpedido,
    data.data.cliente,
    data.data.fecha.split(" ")
  );
  try {
    if (data.data.pdf === null) {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "Done",
        mensajePeticion: "pedido realizado",
        tipoConsulta: "PEDIDO",
        // canalUsuario: canalUsuario,
      };
      io.emit("estadocorreo", respuesta);
    } else {
      let mensaje = `<p>
        Estimado(a) <b>${data.data.cliente.nombre}</b>,<br><br>
    
        Hemos recibido su solicitud de pedido con número <b>${data.data.idpedido}</b>, registrada el día <b>${data.data.fecha}</b>.<br><br>
    
        Adjunto encontrará el documento en formato PDF con el detalle de los productos solicitados, incluyendo cantidades, precios estimados y condiciones generales.<br><br>
    
        <i>Este documento no constituye una factura, sino una confirmación de su solicitud para revisión y posterior procesamiento.</i><br><br>
    
        Si desea realizar algún ajuste o tiene preguntas adicionales, no dude en comunicarse con nosotros.<br><br>
    
        Saludos cordiales,<br><br>
    
        <b>
            NOMBRE EMPRESA:</b>${io.request.session.usuario.config.RAZON_SOCIAL}<br>
        <b>TELEFONO:</b>:${io.request.session.usuario.config.TELEFONO_PRINCIPAL}  &nbsp; | &nbsp; <b>CORREO:</b>${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}<br>
        <b>VENDEDOR:</b>${io.request.session.usuario.vendedor} 
    </p>`;
      let message = {
        from: `${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`,
        to: [`${data.data.cliente.email}`, `${data.data.email}`],
        subject: "Message title",
        text: "Plaintext version of the message",
        html: mensaje,
        cc: [`${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`],
        bcc: [`${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`],
        subject: `Comprobante de pedido solicitado`,
        attachments: [
          {
            filename: "pedido.pdf", //nombre del archivo
            content: Buffer.from(data.data.pdf, "base64"),
            contentType: "application/pdf",
          },
        ],
      };
      let transpor = await crearcorreo(
        io.request.session.usuario.config.CORREO_ENVIO_PEDIDO,
        io.request.session.usuario.config.CONTRASENA_ENVIO_PEDIDO
      );
      console.log(io.request.session.usuario.config);
      transpor.sendMail(message, (error) => {
        if (error) {
          console.log(error);
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion:
              "pedido realizado pero correo no enviado quieres intentar",
            tipoConsulta: "PEDIDO",
            //canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        } else {
          console.log("correo enviado");
          respuesta = {
            sistema: "POS",
            estadoPeticion: "Done",
            mensajePeticion: "pedido realizado",
            tipoConsulta: "PEDIDO",
            // canalUsuario: canalUsuario,
          };
          io.emit("estadocorreo", respuesta);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

async function enviarDataingresos(io, data) {
  try {
    if (data.data.pdf === null) {
      respuesta = {
        sistema: "POS",
        estadoPeticion: "Done",
        mensajePeticion: "rezibode caja realizado",
        tipoConsulta: "PEDIDO",
        // canalUsuario: canalUsuario,
      };
      io.emit("estadocorreo", respuesta);
    } else {
      let mensaje = `<p>
      Comprobante   recibo de ingreso 
    </p>`;
      let message = {
        from: `${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`,
        to: [`${data.data.cliente.email}`, `${data.data.email}`],
        subject: "Message title",
        text: "Plaintext version of the message",
        html: mensaje,
        cc: [`${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`],
        bcc: [`${io.request.session.usuario.config.CORREO_ENVIO_PEDIDO}`],
        subject: `Comprobante de pedido solicitado`,
        attachments: [
          {
            filename: "pedido.pdf", //nombre del archivo
            content: Buffer.from(data.data.pdf, "base64"),
            contentType: "application/pdf",
          },
        ],
      };
      let transpor = await crearcorreo(
        io.request.session.usuario.config.CORREO_ENVIO_PEDIDO,
        io.request.session.usuario.config.CONTRASENA_ENVIO_PEDIDO
      );
      console.log(io.request.session.usuario.config);
      transpor.sendMail(message, (error) => {
        if (error) {
          console.log(error);
          respuesta = {
            sistema: "POS",
            estadoPeticion: "ERROR",
            mensajePeticion:
              "pedido realizado pero correo no enviado quieres intentar",
            tipoConsulta: "PEDIDO",
            //canalUsuario: canalUsuario,
          };
          io.emit("estadocorreoingreso", respuesta);
        } else {
          console.log("correo enviado");
          respuesta = {
            sistema: "POS",
            estadoPeticion: "Done",
            mensajePeticion: "pedido realizado",
            tipoConsulta: "PEDIDO",
            // canalUsuario: canalUsuario,
          };
          io.emit("estadocorreoingreso", respuesta);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  enviarDataEmail,
  enviarDataingresos,
};
