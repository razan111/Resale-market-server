const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;


const app = express()

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llsjgoo.mongodb.net/?retryWrites=true&w=majority`;

// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollections = client.db('resalestore').collection('services')

        const buyersCollection = client.db('resalestore').collection('buyers')

        app.get('/services', async(req, res) =>{
            const query = {}
            const options = await serviceCollections.find(query).toArray()
            res.send(options)
        })

        app.post('/buyer', async(req, res) =>{
            const buyer = req.body;
            const result = await buyersCollection.insertOne(buyer)
            res.send(result)
        })

        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email}
            const buyer = await buyersCollection.findOne(query)

            if(buyer){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1d'})
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
        })



    }
    finally{

    }

}
run().catch(console.log)


app.get('/', async(req, res) =>{
    res.send('resale server running')
})

app.listen(port, () => {
    console.log(`Resale running on: ${port}`)
})