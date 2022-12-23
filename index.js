const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query, json } = require('express');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.06w34xu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const userCollection = client.db('mobile-mart').collection('users');
        const productCollection = client.db('mobile-mart').collection('products');
        const categoriesCollection = client.db('mobile-mart').collection('categories');
        const bookingCollection = client.db('mobile-mart').collection('bookings');

        app.post('/users', async (req, res) => {
            const user = req.body;
            const email = req.body.email;
            const query = { email }
            const queryResult = await userCollection.findOne(query);
            console.log(queryResult);
            if (queryResult === null) {
                const result = await userCollection.insertOne(user);
                res.send(result)
            }
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await userCollection.findOne(query);
            res.send(result)
        })

        app.put('/verify-user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    varified: true
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.put('/promote/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    promoted: true
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.get('/promoted-products', async (req, res) => {
            const result = await productCollection.find({promoted: true}).toArray();
            res.send(result);
        })

        app.delete('/users/:email', async (req, res) => {
            const email = req.params.email;
            const deletedUser = await userCollection.findOne({ email });
            const query = { sellersId: { $regex: deletedUser._id.toString() } };
            const deleteProduct = await productCollection.deleteMany(query);
            const deleteBookings = await bookingCollection.deleteMany({ buyerEmail: { $regex: email } })
            const result = await userCollection.deleteOne({ email })
            res.send(result)
        })

        app.get('/userid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.findOne(query);
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const productDetails = req.body;
            // console.log(productDetails);
            const result = await productCollection.insertOne(productDetails);
            res.send(result)
        })

        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id };
            const result = await productCollection.find(query).toArray()
            res.send(result);
        })

        app.get('/my-products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { sellersId: id };
            const result = await productCollection.find(query).toArray()
            res.send(result);
        })

        app.post('/book-now', async (req, res) => {
            const bookData = req.body;
            console.log(bookData);
            const result = await bookingCollection.insertOne(bookData);
            res.send(result)
        })

        app.delete('/my-products/:id', async (req, res) => {
            const id = req.params.id;
            const deleteProduct = await productCollection.deleteOne({ _id: ObjectId(id) });
            if (deleteProduct.acknowledged) {
                const result = await bookingCollection.deleteOne({ productId: id });
                res.send(result);
            }
        })

        app.get('/all-user/:type', async (req, res) => {
            const type = req.params.type;
            const capType = type.charAt(0).toUpperCase() + type.slice(1)
            const query = { accountType: capType };
            const result = await userCollection.find(query).toArray();
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', async (req, res) => {
    res.send('Your Mongo Server For Mobile Mart is Running and Goood To Goooo!');
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`))