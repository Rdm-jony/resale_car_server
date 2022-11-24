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
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    user
                }
            }

            const result = await userCollection.updateOne(filter, updateDoc, option)

            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "10h" })

            res.send({token,result})

        })

    }
    finally {

    }
}
run().catch(e => console.log(er))