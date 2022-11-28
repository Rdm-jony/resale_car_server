const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require("stripe")(process.env.SECRETE_KEY_STRIPE);



//middleware
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("car server running")
})

app.listen(port, () => {
    console.log(`car server running on port ${port}`)
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbsccmb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try {
        const userCollection = client.db("resellCar").collection("users")
        const productCollection = client.db("resellCar").collection("products")
        const bookingCollection = client.db("resellCar").collection("bookings")
        const paymentCollection = client.db("resellCar").collection("payments")
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;

            const filter = { email: email }
            const findUser = await userCollection.findOne(filter)
            if (!findUser) {
                const option = { upsert: true }
                const updateDoc = {
                    $set: {
                        email: user?.email,
                        role: user?.role,
                        name: user?.name
                    }
                }

                const result = await userCollection.updateOne(filter, updateDoc, option)
                res.send({ result })

            }

            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "10h" })

            res.send({ token })

        })

        app.put("/users/verify/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    verified: req.body.isVerified
                }
            }
            const result = await userCollection.updateOne(query, updateDoc, option)
            res.send(result)
        })

        app.get("/users/seller/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)

            res.send({ isSeller: result.role === "Seller" })
        })
        app.get("/users/admin/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)

            res.send({ isAdmin: result.role === "Admin" })
        })

        app.get("/users/buyer/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await userCollection.findOne(query)

            res.send({ isBuyer: result.role === "Buyer" })
        })

        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.put("/products/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    verified: req.body.isVerified
                }
            }
            const verifItem = await productCollection.updateMany(query, updateDoc, option)
            res.send(verifItem)

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

        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.send(result)
        })

        app.post("/bookings", async (req, res) => {
            const product = req.body;
            const result = await bookingCollection.insertOne(product)
            res.send(result)
        })

        app.get("/bookings/:email", async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })

        app.get("/bookings/payment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.findOne(query)
            res.send(result)
        })

        app.put("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    paid: true
                }
            }
            const result = await bookingCollection.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        app.post("/payments", async (req, res) => {
            const paymentInfo = req.body;
            const result = await paymentCollection.insertOne(paymentInfo)
            res.send(result)
        })

        app.get("/my-products/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })
        app.put("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    status: "sold",
                    advertise: false
                }
            }
            const result = await productCollection.updateOne(query, updateDoc, option)
            res.send({ result, updateDoc })

        })

        app.put("/advertisment/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updateDoc = {
                $set: {
                    advertise: req.body.isAdvertised
                }
            }
            const result = await productCollection.updateOne(query, updateDoc, option)
            res.send(result)
        })


        app.get("/advertisment", async (req, res) => {
            const query = {}
            const results = await productCollection.find(query).toArray()
            const filter = results.filter(result => result.advertise === true)
            res.send(filter)
        })

        app.get("/all-buyers", async (req, res) => {
            const query = {}
            const results = await userCollection.find(query).toArray()
            const filter = results.filter(result => result.role === "Buyer")
            res.send(filter)
        })
        app.get("/all-sellers", async (req, res) => {
            const query = {}
            const results = await userCollection.find(query).toArray()
            const filter = results.filter(result => result.role === "Seller")
            res.send(filter)
        })

        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const amount = req.body.productPrice;
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                "payment_method_types": [
                    "card"
                ],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

    }
    finally {

    }
}
run().catch(er => console.log(er))