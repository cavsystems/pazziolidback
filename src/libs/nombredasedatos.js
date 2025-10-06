

let nombre=''
const nombredb=(nombre_db='')=>{
    return new Promise((resolve,reject)=>{
        
        nombre=nombre_db
         resolve(true)
    })

}

const getNombre = () => nombre;

module.exports={
    getNombre,
    nombredb
}
