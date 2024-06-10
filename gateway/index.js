const express = require("express")
const jwt =require("jsonwebtoken")
const app=express();
const PORT = 8000;
const cors=require("cors")
const proxy = require("express-http-proxy")
console.log("gateway")
 app.use(cors())
app.use(express.json()) 


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, "secretKey", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}




app.use("/auth-service",proxy("http://localhost:7070"))
console.log("order")
app.use("/order-service",authenticateToken,proxy("http://localhost:9090"))
console.log("product")
app.use("/product-service",authenticateToken,proxy("http://localhost:8080"))
app.use("/",(req,res)=>{

    res.json({message:"try connnection"})
    
})

app.listen(PORT,()=>{
    console.log(`Api Gateway running on port ${PORT}`)
})