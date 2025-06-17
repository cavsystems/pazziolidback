const { sequelize } = require("../config/db");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { modelpedidoreservado } = require("../models/models/pedidos");
const fs = require("fs/promises");
const escpos = require("escpos");
const { response } = require("express");
class Pedidocontrol {
  constructor() {}

  async obtenerpedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let consulta;
    const inicio = req.query.pagina > 0 ? req.query.pagina * 15 - 15 : 0;
    const busqueda =
      !isNaN(req.query.busqueda) && isFinite(req.query.busqueda)
        ? req.query.busqueda
        : req.query.busqueda.toUpperCase();
    if (busqueda && busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,p.totalpedido as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } and (t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%') and  p.estado='${
          req.query.estado
        }'limit  ${inicio},${15} `;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor ,v.identificacion as cedula,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,p.totalpedido as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } and t.razonSocial like '%${busqueda}%'  or p.codigo like '%${busqueda}%' or v.nombre like '%${busqueda}%'   limit  ${inicio},${15} `;
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado !== "" &&
        req.query.estado !== "TODO"
      ) {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,p.totalpedido as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        }  and  p.estado='${req.query.estado}'  limit ${inicio},${15}`;
      } else {
        consulta = `SELECT p.codigo AS codigo_pedido,p.codigoUsuario AS codigousuario,p.fechaCreacion as fecha_creacion,v.nombre AS nombrevendedor,v.identificacion as cedula ,p.horaCreacion AS  hora
        ,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
         , p.estado AS estadopedido,p.totalpedido as totalpedido,t.email,t.identificacion ,t.telefonoFijo,t.direccion FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
        v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${
          req.session.usuario.documento
        } limit ${inicio},${15}`;
      }
    }

    let pedidos_obtenidos = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (pedidos_obtenidos.length > 0) {
      if (req.session.usuario.documento !== pedidos_obtenidos[0].cedula) {
        pedidos_obtenidos = [];
      }
    }

    return res.status(200).json({ pedidos: pedidos_obtenidos });
  }

  async optenernumeroregistro(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    let resultado;

    if (req.query.busqueda && req.query.busqueda !== "") {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        console.log("0");
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p inner join vendedores v  on v.codigo=p.codigoVendedor where v.identificacion=? and p.estado='${req.query.estado}' and estado='${req.query.busqueda}'`,
          { replacements: [req.session.usuario.documento] }
        );
      } else {
        console.log("0.1");
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p inner join vendedores v  on v.codigo=p.codigoVendedor where v.identificacion=? and p.estado='${req.query.busqueda}'`,
          { replacements: [req.session.usuario.documento] }
        );
      }
    } else {
      if (
        req.query.estado &&
        req.query.estado.trim() !== "" &&
        req.query.estado !== "TODO"
      ) {
        console.log("2");
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p inner join vendedores v  on v.codigo=p.codigoVendedor where v.identificacion=? and p.estado='${req.query.estado}'`,
          { replacements: [req.session.usuario.documento] }
        );
      } else {
        console.log("1");
        resultado = await sequelize.query(
          `SELECT COUNT(v.codigo)  as nregistros FROM pedido p inner join vendedores v  on v.codigo=p.codigoVendedor where v.identificacion=?`,
          { replacements: [req.session.usuario.documento] }
        );
      }
    }
    sequelize.close();

    let result = Math.round(resultado[0][0].nregistros / 15);
    if (result === 0) {
      result = 1;
    }
    return res
      .status(200)
      .json({ response: true, nregistros: { nregistros: result } });
  }

  async odteneritemspedido(req, res) {
    const codigopedido = req.query.codigo;
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);

    const consulta = `SELECT p.totalPedido AS total,i.cantidad AS cantidad
     ,r.descripcion AS nombre ,precio1 AS precio
     ,r.codigo AS codigo,r.descripcion AS nombre ,r.referencia AS referencia,r.presentacion AS presentacion ,r.precio1 AS precio
     FROM pedido p INNER JOIN itemspedido i INNER JOIN productos r INNER JOIN tercero t ON p.codigo=i.codigoPedido AND p.codigoTercero=t.codigo AND i.codigoProducto=r.codigo WHERE p.codigo=?`;
    const result = await sequelize.query(consulta, {
      replacements: [codigopedido],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({
      result,
      config: req.session.usuario.config,
      vendedor: req.session.usuario.vendedor,
    });
  }

  async reservarpedido(req, res) {
    const { cliente, productos_pedido } = req.body;

    const newpedidoreservado = new modelpedidoreservado({
      vendedor: req.session.usuario.documento,
      cliente: cliente,
      productos_pedido,
    });

    const nuevopedido = await newpedidoreservado.save();
    res.json({ message: "Pedido guardado", pedido: nuevopedido });
  }

  async pedidosreversado(req, res) {
    const pedido = await modelpedidoreservado.find({
      vendedor: req.session.usuario.documento,
    });

    return res.json({
      pedido,
    });
  }

  async actulizarreservados(req, res) {
    try {
      const { id } = req.params;

      const pedido = await modelpedidoreservado.findById(id);

      const productosreservado = await modelpedidoreservado.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      );
      return res.json({ message: "Pedido actualizado" });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "error inesperado", error: error });
    }
  }
  async anularpedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    try {
      let fecha = new Date();
      const pad = (n) => n.toString().padStart(2, "0");

      let diaActual =
        fecha.getFullYear() +
        "-" +
        pad(fecha.getMonth() + 1) +
        "-" +
        pad(fecha.getDate());

      let horaActual =
        pad(fecha.getHours()) +
        ":" +
        pad(fecha.getMinutes()) +
        ":" +
        pad(fecha.getSeconds());

      await sequelize.query(
        "update pedido set estado=? ,codigoUsuarioAnulo=?, fechaAnulo=?  where codigo=? and codigoUsuario=?",
        {
          replacements: [
            req.body.estado,
            Number(req.query.codigousuario),
            diaActual,
            Number(req.query.codigo),
            Number(req.query.codigousuario),
          ],
        }
      );

      await sequelize.query(
        "update itemspedido set estado=? ,usuarioAnulo=?, horaAnulacion=?  where codigoPedido=? and codigoUsuario=?",
        {
          replacements: [
            "INACTIVO",
            Number(req.query.codigousuario),
            horaActual,
            Number(req.query.codigo),
            Number(req.query.codigousuario),
          ],
        }
      );
      res.status(200).json({
        response: true,
        mensaje: "Pedido anulado",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        response: true,
        mensaje: "Ocurrio un erro inesperado",
      });
    }
  }
  async eliminarpedidoreservado(req, res) {
    const { id } = req.params;
    const pedidoid = await modelpedidoreservado.findById(id);

    if (!pedidoid) {
      return res.status(400).json({ message: "pedido no existe" });
    }
    await modelpedidoreservado.findByIdAndDelete(id);
    return res.status(200).json({ repuesta: true });
  }

  async guardarfactura(req, res) {
    const { baseg4 } = req.body;
    //ESC/POS es un lenguaje de comandos creado por Epson y usado por muchas impresoras térmicas para controlar:
    /*
    Texto (centrado, negrita, tamaño)

Corte de papel

Imágenes

Códigos de barras y QR
     */

    //escpoc  es una libreria de node.js que te permite enviar comandos esc/pos facilmente a impresoras termicas conectadas:.usb .re .serie
    //npm install escpos-image También puedes instalar soporte para imágenes si vas a imprimir logos:
    // Usa USB o el tipo de conexión que tengas
    const device = new escpos.USB();
    await fs.writeFile();
  }

  async opdetenernumropedido(req, res) {
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = "select codigo from pedido order by codigo desc limit 1";
    const result = await sequelize.query(consulta, {
      type: sequelize.QueryTypes.SELECT,
    });

    sequelize.close();

    return res.status(200).json({ response: true, codigo: result[0] });
  }

  generarpedidotirilla(req, res) {
    const tirilla = `
       ${body.config.RAZON_SOCIAL}
       ${config.NIT}
       ______________________________
       Fecha: ${req.body.fecha_actual}  ${req.body.horaActual}
       cleinte: ${req.body.cliente.nombre}
       Identificación: ${req.body.cliente.identificacion}
       direccion: ${req.body.cliente.direccion}
       telefonofijo: ${req.body.cliente.telefonoFijo}
       Vendedor: ${req.body.vendedor}
       
      
      
     `;

    return res.json({ data: { tirilla } });
  }

  async cantidad_TotalPedidosPorSemana(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        dias.nombre_dia AS dia_semana,
                        COUNT(p.fechaCreacion) AS cantidad_pedidos,
                        COALESCE(SUM(p.totalPedido),0) AS total_Pedidos_Dia
                      FROM (
                        SELECT 'Lunes' AS nombre_dia, 0 AS dia_num UNION
                        SELECT 'Martes', 1 UNION
                        SELECT 'Miercoles', 2 UNION
                        SELECT 'Jueves', 3 UNION
                        SELECT 'Viernes', 4 UNION
                        SELECT 'Sabado', 5 UNION
                        SELECT 'Domingo', 6
                      ) AS dias
                      LEFT JOIN pedido p
                        ON WEEKDAY(p.fechaCreacion) = dias.dia_num
                        AND YEARWEEK(p.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                        AND p.codigoVendedor = ?
                      GROUP BY dias.nombre_dia, dias.dia_num
                      ORDER BY dias.dia_num;`

    const result = await sequelize.query(consulta, {
      replacements:[Number(req.query.codigoVendedor)],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close(result);
    return res.status(200).json({ response:true, pedidosSemana: result });

  }
async topProductosMasPedidosSemana(req, res){
  const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
  const consulta = `SELECT 
                        pr.codigo AS codigo_producto,
                        pr.descripcion AS descripcion_producto,
                        SUM(ip.cantidad) AS total_pedida
                    FROM 
                        itemspedido ip
                    JOIN 
                        pedido p ON ip.codigoPedido = p.codigo
                    JOIN 
                        productos pr ON ip.codigoProducto = pr.codigo
                    WHERE 
                        p.codigoVendedor=?
                        AND p.estado != 'ANULADO' 
                        AND YEARWEEK(p.fechaCreacion, 1) = YEARWEEK(CURDATE(), 1)
                    GROUP BY 
                        pr.codigo, pr.descripcion
                    ORDER BY 
                        total_pedida DESC
                    LIMIT 5;`
                  
  const result = await sequelize.query(consulta, {
    replacements:[Number(req.query.codigoVendedor)],
    type: sequelize.QueryTypes.SELECT,
  });
  sequelize.close();
  return res.status(200).json({ response:true, TopProductosSemana: result });
}

async totalPedidosVendedorMes(req, res){
  const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
  const consulta = `SELECT 
                      count(p.codigo) AS total_pedidos_mes
                    FROM 
                      pedido p
                    WHERE 
                      p.estado != 'ANULADO'
                      AND codigoVendedor = ?
                      AND MONTH(p.fechaCreacion) = MONTH(CURDATE())
                      AND YEAR(p.fechaCreacion) = YEAR(CURDATE());`
                  
  const result = await sequelize.query(consulta, {
    replacements:[Number(req.query.codigoVendedor)],
    type: sequelize.QueryTypes.SELECT,
  });
  sequelize.close();
  return res.status(200).json({ response:true, cantidadTotalPedidosMes: result });
}

  async cargarTotalPedidosVsTotalRecibosIngresoMes(req, res){
    const { sequelize } = crearConexionPorNombre(req.session.usuario.db);
    const consulta = `SELECT 
                        s.semana,
                        IFNULL(p.totalPedidosSemana, 0) AS totalPedidosSemana,
                        IFNULL(r.totalRecibosSemana, 0) AS totalRecibosSemana
                      FROM
                        (SELECT 1 AS semana UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) s
                      LEFT JOIN (
                        SELECT 
                          WEEK(fechaCreacion, 1) - WEEK(DATE_SUB(fechaCreacion, INTERVAL DAYOFMONTH(fechaCreacion)-1 DAY), 1) + 1 AS semanaDelMes,
                          SUM(totalPedido) AS totalPedidosSemana
                        FROM pedido
                        WHERE estado != 'ANULADO'
                          AND MONTH(fechaCreacion) = MONTH(CURDATE())
                          AND YEAR(fechaCreacion) = YEAR(CURDATE())
                          AND codigoVendedor = ?
                        GROUP BY semanaDelMes
                      ) p ON s.semana = p.semanaDelMes
                      LEFT JOIN (
                        SELECT 
                          WEEK(fechaIngreso, 1) - WEEK(DATE_SUB(fechaIngreso, INTERVAL DAYOFMONTH(fechaIngreso)-1 DAY), 1) + 1 AS semanaDelMes,
                          SUM(valor) AS totalRecibosSemana
                        FROM reciboIngreso
                        WHERE MONTH(fechaIngreso) = MONTH(CURDATE())
                          AND YEAR(fechaIngreso) = YEAR(CURDATE())
                          AND codigoVendedor = ?
                        GROUP BY semanaDelMes
                      ) r ON s.semana = r.semanaDelMes
                      ORDER BY s.semana;`
    const result = await sequelize.query(consulta, {
      replacements:[
        Number(req.query.codigoVendedor),
        req.query.codigoVendedor],
      type: sequelize.QueryTypes.SELECT,
    });
    sequelize.close();
    return res.status(200).json({ response:true, tPedidosVsTRecibosISemas: result });
  }

}

module.exports = {
  pedidocontroller: new Pedidocontrol(),
};
