const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
require('colors');

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0269g6x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect()
    console.log('DB Connected'.yellow.italic);

    const postCollection = client.db('KitoAdda').collection('allPost');
    const userCollection = client.db('KitoAdda').collection('users');

    app.post('/postData', async (req, res) => {
      const data = req.body;
      const result = await postCollection.insertOne(data);
      res.send(result);
    })

    app.get('/allPost', async(req, res) => {
      const query = {};
      const result = await postCollection.find(query).toArray();
      res.send(result);
    })
  }

  finally {

  }
}

run().catch(error => console.log(error.name.bgRed, error.message.bold));


app.get('/', (req, res) => {
  res.send('kitoAdda server is running')
});

app.listen(port, () => {
  console.log(`server run on the port ${port}`.cyan);
});
