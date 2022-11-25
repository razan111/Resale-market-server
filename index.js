const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config()

const jwt = require('jsonwebtoken');


app.use(cors())
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llsjgoo.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT (req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded
        next();
    })

}


async function run(){
    try{

        const usersCollection = client.db('resalePortal').collection('users')

        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query = {email: email}
            const user = await usersCollection.findOne(query)
            if(user && user.email){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'})
                return res.send({accessToken: token})
            }
            console.log(user)
            res.status(403).send({accessToken: ''})

        })

        app.get('/users', async(req, res) =>{
            const query = {};
            const users = await usersCollection.find(query).toArray()
            res.send(users)
        })


        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })


    }

    finally{

    }
}

run().catch(console.log)



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})