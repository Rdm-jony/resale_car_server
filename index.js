const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
const jwt = require('jsonwebtoken');

require('dotenv').config()


//middleware
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("car server running")
})

app.listen(port, () => {
    console.log(`car server running on port ${port}`)
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbsccmb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)

const run = async () => {
    try {
        const userCollection = client.db("resellCar").collection("users")
        const productCollection = client.db("resellCar").collection("products")
        const bookingCollection = client.db("resellCar").collection("bookings")
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    email: user?.email,
                    role: user?.role
                }
            }

            const result = await userCollection.updateOne(filter, updateDoc, option)

            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "10h" })

            res.send({ token, result })

        })

        app.get("/users/seller/:email",async(req,res)=>{
            const email=req.params.email;
            const query={email:email}
            const result=await userCollection.findOne(query)
            console.log(result)
            res.send({isSeller:result.role==="Seller"})
        })

        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.get("/poducts-category", async (req, res) => {
            const query = {}
            const result = await productCollection.distinct("category")
            res.send(result)
        })
        app.get("/products", async (req, res) => {
            const query = {}
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })
        app.get("/products/:category", async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })

        app.post("/bookings", async (req, res) => {
            const product = req.body;
            const result = await bookingCollection.insertOne(product)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(e => console.log(er))