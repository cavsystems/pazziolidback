const { creartokenvendedor } = require("../libs/jwt");
const {usuario}=require("../models/user-model")
const {vendedor}=require("../models/vendedor-model")
const jwt=require('jsonwebtoken')
class Useraccioneauth{
    constructor(){

    }
    async login(req,res){
      //  const {user,documento}=req.body
      const {user,documento}=req.body
       const usuari=await vendedor.findAll({
        where:{
            identificacion:documento
        }
       }
       );

          if(usuari.length>0){
           const token=await creartokenvendedor({documento:usuari[0].identificacion})
           res.status(200).json({token})

          }else{
            res.status(404).json({error:"vendedor no existente"})
          }
    }

    verificarauth(req,res){
      console.log(req.headers)
      
       const token=req.headers['authorization'].split(' ')[1]
         jwt.verify(token,process.env.SECRET_TOKEN,async (err,vendedor)=>{
         if(err){
            return res.json({response:false})
         }
         

         return res.json({response:true})

    })
      
       }
    }

   


module.exports={
    usuarioauth:new Useraccioneauth()
}