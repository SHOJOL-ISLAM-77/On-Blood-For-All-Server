const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 7000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u6ptml9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const divisionCollection = client.db("OneBloodDB").collection("divisions");
    const districtsCollection = client.db("OneBloodDB").collection("districts");
    const upazilasCollection = client.db("OneBloodDB").collection("upazilas");
    const usersCollection = client.db("OneBloodDB").collection("users");

    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    //user related api

    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await usersCollection.findOne(query);
      console.log("User from is isExist.....", isExist);
      if (isExist) return res.send(isExist);
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user },
        },
        options
      );
      res.send(result);
    });

    // location related api

    app.get("/division", async (req, res) => {
      const result = await divisionCollection.find().toArray();
      res.send(result);
    });
    app.get("/division/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const result = await divisionCollection.findOne(query);
      res.send(result);
    });

    app.get("/districts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { division_id: id };
      const result = await districtsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/districtsName/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id: id };
      const result = await districtsCollection.findOne(query);
      res.send(result);
    });

    app.get("/upazilas/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        district_id: id,
      };
      const result = await upazilasCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Blood running");
});

app.listen(port, () => {
  console.log(`Blood donation is running on port ${port}`);
});
