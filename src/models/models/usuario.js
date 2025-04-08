const mongoose=require('mongoose')
const usuario=new mongoose.Schema(
{
    documento:{
    type:String,
    required:true,
    trim:true,
    unique:true},
    db:{
        type:String,

    },
    compra:{
        type:[],
        
    }

 }
)
const modeluser=mongoose.model("usuario",usuario)
module.exports={
   modeluser
}