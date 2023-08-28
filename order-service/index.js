const express = require("express")
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const PORT =process.env.PORT_ORDER || 9090;
const Order = require("./Order")
const amqp= require("amqplib")
const isAuthenticated= require("../isAuthenticated")

var channel,connection;

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/order-service",
{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

async function connect(){
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER")
}

function createOrder(products,userEmail){
    let total =0;
    for(let t=0;t<products.length;++t){
        total+=products[t].price;
    }

    const newOrder= new Order({
        products,
        user:userEmail,
        total_price:total
    });
    newOrder.save();
    return newOrder;
}

connect().then(()=>{
    channel.consume("ORDER",data=>{
        console.log("Consuming ORDER queue")
        const {products,userEmail} =JSON.parse(data.content);
        const newOrder = createOrder(products,userEmail);
        console.log(newOrder)
        channel.ack(data);

        channel.sendToQueue("PRODUCT",Buffer.from(JSON.stringify({newOrder})))
    })
})



app.listen(PORT, ()=>{
    console.log(`Order Service at ${PORT}`)
})