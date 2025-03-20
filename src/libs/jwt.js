const jsontoken=require("jsonwebtoken")
const creartokenvendedor=(dato)=>{
    return new Promise((resolve,reject)=>{
        jsontoken.sign(dato,process.env.SECRET_TOKEN,(err,token)=>{
            if(err) reject(err)
            resolve(token)
        })
    })
}

module.exports={
    creartokenvendedor
}