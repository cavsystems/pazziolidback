const { sequelize } = require("../config/db");
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { modelpedidoreservado } = require("../models/models/pedidos");

class Pedidocontrol{
    constructor(){

    }

   async obtenerpedido(req,res){
    console.log(req.session.usuario)
        const {sequelize}=crearConexionPorNombre(req.session.usuario.db)
        let consulta=`SELECT p.codigo AS codigo_pedido,v.identificacion AS documentovendedor
,t.apellido1 AS nombre_cliente ,t.razonSocial AS razonsocial_clientes
 , p.estado AS estadopedido FROM pedido p INNER JOIN  tercero t INNER JOIN vendedores v ON
v.codigo=p.codigoVendedor AND p.codigoTercero=t.codigo where v.identificacion=${req.session.usuario.documento}`

  const pedidos_obtenidos= await sequelize.query(consulta, { type: sequelize.QueryTypes.SELECT})
return res.status(200).json({pedidos:pedidos_obtenidos})
      
    }

   async odteneritemspedido(req,res){
       const codigopedido=req.query.codigo
       const{sequelize}=crearConexionPorNombre(req.session.usuario.db)
       console.log(codigopedido)
     const consulta=`SELECT p.totalPedido AS total,i.cantidad AS cantidad
     ,r.descripcion AS nombre ,precio1 AS precio
     ,r.codigoBarra AS codigoBarra,r.cantidad2 AS cantidaddisponible 
     FROM pedido p INNER JOIN itemspedido i INNER JOIN productos r INNER JOIN tercero t ON p.codigo=i.codigoPedido AND p.codigoTercero=t.codigo AND i.codigoProducto=r.codigo WHERE p.codigo=?`
     const result=await sequelize.query(consulta,{
        replacements:[codigopedido],
        type: sequelize.QueryTypes.SELECT,
 })
     sequelize.close(result);
     return res.status(200).json(result)
    }


    async reservarpedido(req,res){
       const  {cliente,productos_pedido}=req.body
        console.log(req.body)

       const newpedidoreservado=new modelpedidoreservado(
        {     
            vendedor:req.session.usuario.documento,
            cliente:cliente,
            productos_pedido


        }
       )

       const nuevopedido=await newpedidoreservado.save()
       res.json({message:"pedidoguardado",pedido:nuevopedido})
    }

    async pedidosreversado(req,res){
      const pedido= await modelpedidoreservado.find({
       vendedor:req.session.usuario.documento
       }) 


       return res.json({
        pedido
       })
        


    }

    async actulizarreservados(req,res){
        try {
            const {id}=req.params
            const pedido=await modelpedidoreservado.findById(id)
    
            console.log(pedido)
            const productosreservado=await modelpedidoreservado.findByIdAndUpdate(id,{$set:req.body},{new:true})
           return res.json({message:"pedido actulizado"}) 
        } catch (error) {
          return  res.status.json({message:"error inesperado",error:error})
        }
      

    }
   
}


module.exports={
    pedidocontroller:new Pedidocontrol()
}