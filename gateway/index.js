const express = require("express")
const app=express();
const PORT = 8000;
const cors=require("cors")
const proxy = require("express-http-proxy")
console.log("gateway")
 app.use(cors())
app.use(express.json()) 



console.log("auth")
app.use("/auth-service",proxy("http://localhost:7070"))
console.log("order")
app.use("/order-service",proxy("http://localhost:9090"))
console.log("product")
app.use("/product-service",proxy("http://localhost:8080"))
app.use("/",(req,res)=>{

    res.json({message:"deneme bağlantısı"})
    
})

app.listen(PORT,()=>{
    console.log("Api Gateway 8000")
})