const PDFDocument = require("pdfkit");

async function generarTirillaPDF(usuario, productos, idpedido, cliente, fecha) {
  console.log(cliente);
  console.log("pedidos", productos[0]);
  const getStream = (await import("get-stream")).default;
  const total = productos.reduce((sum, data) => {
    return sum + data.total;
  }, 0);
  const total_items = productos.reduce((sum, data) => {
    return sum + data.cantidad;
  }, 0);

  //Crea un nuevo documento PDF con un tamaño personalizado estrecho, ideal para recibos (200 puntos ≈ 7 cm de ancho).
  const doc = new PDFDocument({
    size: [120, 600], // tamaño tipo tirilla (ancho x alto en puntos)
    margin: 10,
  });
  //Cada vez que el PDF genera datos binarios, los agrega al arreglo chunks.
  const chunks = [];
  // doc.on("data", (chunk) => chunks.push(chunk));
  // doc.on("end", () => {});
  // Fuente y contenido
  doc.on("data", (chunk) => chunks.push(chunk));

  // Resolvemos la promesa cuando termine el documento
  //Crea una promesa que se resuelve cuando el PDF termina de generarse.
  const endPromise = new Promise((resolve) => doc.on("end", resolve));

  doc
    .font("Courier") // fuente monoespaciada para buena alineación
    .fontSize(5)
    .text(usuario.config.RAZON_SOCIAL, { align: "center" })
    .text(`${usuario.config.NIT}`, { align: "center" })
    .text(`Pedido No:${idpedido}`, { align: "center" })
    .moveDown()
    .text("________________________________")
    .moveDown()
    .text(`Fecha: ${fecha[0]}  ${fecha[1]}`)
    .text(`Cliente: ${cliente.nombre}`)
    .text(`Identificación: ${cliente.identificacion}`)
    .text(`Dirección: ${cliente.direccion}`)
    .text(`Correo: ${cliente.email}`)
    .text(`Telefono: ${cliente.telefonoFijo}`)

    .text("________________________________")
    .moveDown()
    .text("ref       descripción      ")
    .text("cantidad  valor/uni  iva  total")
    .text("________________________________")
    .moveDown();
  productos.map((datos) => {
    doc
      .text(`${datos.referencia}   ${datos.nombre}  `)
      .text(
        `${datos.cantidad}    x   ${datos.precio.toLocaleString("de-DE")}     ${
          datos.tasaiva
        }     ${datos.total.toLocaleString("de-DE")}`
      );
  });

  doc
    .moveDown()
    .text("_________________________________")
    .text(`Total venta:${total.toLocaleString("de-DE")}`, { align: "right" })
    .moveDown()
    .text(`Total items:${total_items}`, { align: "center" })
    .moveDown()
    .text("Gracias por su compra", { align: "center" });
  //Finaliza la escritura del PDF y espera a que se complete el documento.
  doc.end();

  await endPromise; // Esperamos a que termine de generarse
  //Combina todos los fragmentos (chunks) en un solo Buffer, que representa el archivo PDF completo. Este buffer lo puedes enviar como adjunto
  const buffer = Buffer.concat(chunks);
  return buffer;
}

module.exports = {
  generarTirillaPDF,
};
