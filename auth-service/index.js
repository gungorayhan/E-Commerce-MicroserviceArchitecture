const express = require("express")
const app= express();
const PORT = process.env.PORT_ONE || 7070;
const mongoose = require("mongoose")
const User = require("./User")
const jwt = require("jsonwebtoken");



app.use(express.json());
mongoose.connect("mongodb://127.0.0.1:27017/auth-service",
{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

app.post("/auth/login",async(req,res)=>{
    const {email,password}=req.body

    const user= await User.findOne({email});
    if(!user){
        return res.json({message:"User don't exists"});
    }
    else{
        if(password!==user.password)
        {
            return res.json({message:"Password Incorrent"})
        }

        const payload={
            email,
            name:user.name,
        };

        jwt.sign(payload,"secretKey",(err,token)=>{
            if(err) console.log(err)
            else{
                return res.json({token:token})
            }
        })
    }
})

app.post("/auth/register",async(req,res)=>{
    const {email,password,name} = req.body;

    const userExists = await User.findOne({email})
    if(userExists){
       return res.json({message:"user already exists"})
    }else{
        const newUser = new User({
            name,
            email,
            password,
        })

        newUser.save();
        return res.json(newUser);
    }
})


app.listen(PORT,()=>{
    console.log(`Auth Service at ${PORT}`)
})