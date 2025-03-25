const { creartokenvendedor } = require("../libs/jwt");
const {usuario}=require("../models/user-model")
const {vendedor}=require("../models/vendedor-model")
const {usuarioaliasalmacen}=require("../models/usuarioaliasalmacen")
const jwt=require('jsonwebtoken');
const { almacen } = require("../models/almacen");
class Useraccioneauth{
    constructor(){
       
    }
    async login(req,res){
      //  const {user,documento}=req.body
      const {user,documento}=req.body
       let usuari=await usuarioaliasalmacen.findAll({
        include:[
          {model:vendedor,
          attributes:['identificacion','codigo'],
          where: {
            identificacion:documento// <-- Aquí va tu filtro
          }
        }
        ,
          {model:almacen,
          attributes:['almacen']
        }

      ]
    }
       );
      usuari=usuari.map(u=>u.toJSON())
          if(usuari.length>0){
             console.log(usuari[0])
            req.session.usuario = {
               documento:usuari[0]. vendedor.identificacion,
               almacen:usuari[0].almacen.almacen,
               codigo:usuari[0].vendedor.codigo
            };
            res.status(200).json({atenticado:true})
 
          }else{
            res.status(404).json({error:"vendedor no existente"})
          }
    }

    verificarauth(req,res){
     
      const {usuario}=req.session

      if(usuario){
        res.json({response:true})
      }else{
        res.json({response:false})
      }
      
       
    }

    logout(req,res){
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
        }
        // Opcional: limpiar la cookie de sesión en el cliente
        res.clearCookie('connect.sid');
        res.json({ message: 'Sesión cerrada correctamente' });
      });

    }


  }

   


module.exports={
    usuarioauth:new Useraccioneauth()
}