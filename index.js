const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
  }

  finally {

  }
}
run().catch(error => console.log(error.name.bgRed, error.message.bold));


const postCollection = client.db('KitoAdda').collection('allPost');
    const userCollection = client.db('KitoAdda').collection('users');
    const commentCollection = client.db('KitoAdda').collection('comments');

    app.post('/postData', async (req, res) => {
      const data = req.body;
      const result = await postCollection.insertOne(data);
      res.send(result);
    });

    app.get('/allPost', async (req, res) => {
      const query = {};
      const result = await postCollection.find(query).sort({ date: -1 }).toArray();
      res.send(result);
    });

    app.get('/allPostHome', async (req, res) => {
      const query = {};
      const result = await postCollection.find(query).sort({ likeCount: -1 }).limit(3).toArray();
      res.send(result);
    });


    // store user info in Data base
    app.post('/user', async (req, res) => {
      const user = req.body;
      const email = user.email;
      const query = { email }
      const reqEmail = await userCollection.findOne(query);

      if (!reqEmail) {
        const result = await userCollection.insertOne(user);
        res.send(result);
      }
      else {
        res.send({ acknowledged: true })
      }
    });

    app.put('/user', async (req, res) => {
      const reqUserData = req.body;
      const newName = reqUserData.name;
      const newEmail = reqUserData.email;
      const newAddress = reqUserData.address;
      const newEducation = reqUserData.education;
      
      const reqEmail = req.query.email;
      const filter = { email: reqEmail }
      const userData = await userCollection.findOne(filter);

      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: newName,
          email: newEmail,
          address: newAddress,
          education: newEducation,
        }
      };

      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put('/like/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };

      const postData = await postCollection.findOne(filter);
      let likeCount = postData.likeCount;
      let newLikeCount = likeCount + 1;

      const updateDoc = {
        $set: {
          likeCount: newLikeCount,
        }
      };
      const result = await postCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.post('/comment', async (req, res) => {
      const data = req.body;
      const result = await commentCollection.insertOne(data);
      res.send(result);
    });

    app.get('/allComments', async (req, res) => {
      const query = {};
      const result = await commentCollection.find(query).sort({ date: -1 }).toArray();
      res.send(result);
    });





app.get('/', (req, res) => {
  res.send('kitoAdda server is running')
});

app.listen(port, () => {
  console.log(`server run on the port ${port}`.cyan);
});