const { creartokenvendedor } = require("../libs/jwt");
const path = require('path');
const dbs = require('../config/db');
const jwt=require('jsonwebtoken');
const { dbfiltradas } = require("../libs/dbfiltradas");
const { modeluser } = require('../models/models/usuario');
const { crearConexionPorNombre } = require("../libs/dbhelpers");
const { where } = require("sequelize");
class Useraccioneauth{
    constructor(){
       
    }
    async login(req,res){
      const {user,documento}=req.body
      
      const pertenece= await dbfiltradas(dbs,documento)
      console.log(pertenece)
       if(pertenece.length>0){
        req.session.usuario = {
          documento:documento
        
       };
       return res.json({autenticado:true})
      }
      return res.json({autenticado:false,mensaje:"usuario no existe"})
       
     
     
      
        
         /* if(usuari.length>0){
            
            
           /* req.session.usuario = {
               documento:usuari[0]. vendedor.identificacion,
               almacen:usuari[0].almacen.almacen,
               codigo:usuari[0].vendedor.codigo
            };
            req.session.save(err => {
              if (err) {
                console.error("❌ Error al guardar la sesión:", err);
                return res.status(500).json({ error: 'Error guardando sesión' });
              }
            
              console.log("✅ Sesión guardada correctamente");
              res.status(200).json({ atenticado: true ,almacen:usuari[0].almacen.almacen});
            });
 
          }else{
            res.status(404).json({error:"vendedor no existente"})
          }*/
    }

    verificarauth(req,res){
     
      const {usuario}=req.session
      console.log(usuario)
        console.log(req.session)
      if(usuario){
        res.json({response:true})
      }else{
        res.json({response:false})
      }
      
       
    }

   async logout(req,res){
    
    if(req.session.usuario){
      const saveduser=await modeluser.findOneAndUpdate(
        {documento:req.session.usuario.documento},
        {$set:{db:""}},
        {new:true}
       )
    }
   

      req.session.destroy( async (err) => {
        if (err) {
          console.log(err)
          return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
        }
        // Opcional: limpiar la cookie de sesión en el cliente
        res.clearCookie('connect.sid');
        
       return res.json({ message: 'Sesión cerrada correctamente' });
      });

    }



    async guardarinstanciadb  (req,res){
      const {db,user,contrasena}=req.body
      console.log(req.body)
      const {sequelize,usuario}=crearConexionPorNombre(db)

        const usu=await  usuario.findOne({where:{
          login:user
         }})
         console.log(usu)
         //con get con el parametro plain obtengo los datos obtenidos sin metadatos
         if(!usu){
           return res.status(400).json({response:false,error:"usuario de caja no existe "})
         }
         if(usu.estado!=="ACTIVO"){
          return res.status(400).json({response:false,error:"este usuario de caja se encuentra inactivo"})
         }
        if(usu.password!==contrasena){
          return res.status(400).json({response:false,error:"contraseña incorrecta intenta de nuevo"})
        }
       console.log(usu.get({ plain: true }))
       const userfund=await modeluser.find({
        documento:req.session.usuario.documento
       })
       console.log(userfund)
       
      if(userfund.length>0){
       
        const saveduser=await modeluser.findOneAndUpdate(
          {documento:req.session.usuario.documento},
          {$set:{db:db}},
          {new:true}
         )
        return res.status(200).json({response:true})
       }else{
        
        const newuserseccion=new modeluser({
          documento:req.session.usuario.documento,
          db:db
        })
        const saveduser=await newuserseccion.save();
        
       
       
        return res.status(200).json({response:true})
    }


  }
}

   


module.exports={
    usuarioauth:new Useraccioneauth()
}