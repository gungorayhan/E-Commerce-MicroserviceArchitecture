const jwt= require("jsonwebtoken")

module.exports = async (req,res,next)=>{
    const token =req.headers["authorization"].split(" ")[1];

    if(!token){
        return res.json({message:"not token"})
    }
    else{
        jwt.verify(token,"secretKey",(err,user)=>{
            if(err) return res.json({message:err})
            else{
                req.user=user,
                next();
            }
        })
    }
}