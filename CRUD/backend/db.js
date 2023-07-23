const mongoose= require('mongoose');
mongoose.set('strictQuery', true)

const mongoURI="mongodb://0.0.0.0:27017/b";

const connectToMongo=()=>{
    mongoose.connect(mongoURI,
    ()=>{
        console.log("connected succesfully")
    })
}

module.exports=connectToMongo; 