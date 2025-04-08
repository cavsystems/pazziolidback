const mongoose=require('mongoose')
const connectDB=async ()=>{
    try {
      await mongoose.connect('mongodb://LuisDavid:root125@nuvocloster-shard-00-00.o2dfj.mongodb.net:27017,nuvocloster-shard-00-01.o2dfj.mongodb.net:27017,nuvocloster-shard-00-02.o2dfj.mongodb.net:27017/?ssl=true&replicaSet=atlas-ucr1b4-shard-0&authSource=admin&retryWrites=true&w=majority&appName=nuvocloster') 
      console.log("base de datos conectada") 

    } catch (error) {
        console.log(error)
    }
}
module.exports={
    connectDB
}