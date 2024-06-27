const express = require("express")
const jwt = require("jsonwebtoken")
const app = express();
const PORT = 8000;
const cors = require("cors")
const proxy = require("express-http-proxy")
const helmet = require("helmet");
const morgan = require("morgan");

console.log("gateway")
app.use(cors())
app.use(helmet());
app.use(morgan("combined"));
app.disable("x-powered-by");
app.use(express.json())

// Middleware
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
//--
const rateLimit = 20;
const interval = 60 * 1000;

const requestCounts = {};

setInterval(() => {
    Object.keys(requestCounts).forEach((ip) => {
        requestCounts[ip] = 0; // Her IP adresi için istek sayısını sıfırla
    });
}, interval);

function rateLimitAndTimeout(req, res, next) {
    const ip = req.ip;

 // Güncel IP için istek sayısını artır
    requestCounts[ip] = (requestCounts[ip] || 0) + 1;

  // İstek sayısı sınırlamayı aşarsa
    if (requestCounts[ip] > rateLimit) {

        return res.status(429).json({
            code: 429,
            status: "Error",
            message: "Rate limit exceeded.",
            data: null,
        });
    }

 // Her istek için zaman aşımı belirle (örneğin: 15 saniye)
    req.setTimeout(15000, () => {

        res.status(504).json({
            code: 504,
            status: "Error",
            message: "Gateway timeout.",
            data: null,
        });
        req.abort(); // İsteği iptal et
    });

    next(); // Sonraki middleware'e geç
}


app.use(rateLimitAndTimeout);


app.use("/auth-service", proxy("http://localhost:7070"))
console.log("order")
app.use("/order-service", authenticateToken, proxy("http://localhost:9090"))
console.log("product")
app.use("/product-service", authenticateToken, proxy("http://localhost:8080"))

app.use("/", (req, res) => {

    res.json({ message: "try connnection" })
})

app.listen(PORT, () => {
    console.log(`Api Gateway running on port ${PORT}`)
})