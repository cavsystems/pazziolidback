const nodemailer = require("nodemailer");

const crearcorreo = (correo, contrasena) => {
  console.log(correo, contrasena);
  return new Promise((resolve, reject) => {
    const contactEmail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${correo}`,
        pass: `${contrasena}`,
      },
    });

    resolve(contactEmail);
  });
};

module.exports = {
  crearcorreo,
};
