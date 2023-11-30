const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 7000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const featureCollection = client.db("OneBloodDB").collection("feature");
    const requestCollection = client.db("OneBloodDB").collection("request");
    const blogsCollection = client.db("OneBloodDB").collection("blogs");

    //blogs related api
    app.post("/blog-post", async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    });

    app.get("/blogs", async (req, res) => {
      const status = req.query.status;
      console.log(status);
      if (status === "") {
        const result = await blogsCollection.find().toArray();
        res.send(result);
      } else {
        const query = {
          status: status,
        };
        const result = await blogsCollection.find(query).toArray();
        res.send(result);
      }
    });

    app.delete("/delete-blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await blogsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/update-blog-status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const data = req.body;
      const options = { upsert: true };

      const updateProduct = {
        $set: {
          status: data.status,
        },
      };
      const result = await blogsCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    //requests related api

    app.get("/total-requests", async (req, res) => {
      const result = await requestCollection.find().toArray();
      res.send(result);
    });

    app.post("/create-request", async (req, res) => {
      const request = req.body;
      const result = await requestCollection.insertOne(request);
      res.send(result);
    });

    app.get("/donation-request", async (req, res) => {
      const email = req.query.email;
      const query = { requesterEmail: { $ne: email }, status: "pending" };
      const result = await requestCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/delete-request/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/update-status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const data = req.body;
      const options = { upsert: true };

      const updateProduct = {
        $set: {
          status: data.selectValue,
        },
      };
      const result = await requestCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    app.put("/request-update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {
        _id: new ObjectId(id),
      };
      const data = req.body;
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          requesterName: data.requesterName,
          requesterEmail: data.requesterEmail,
          recipientName: data.recipientName,
          blood: data.blood,
          recipientUpazila: data.recipientUpazila,
          districtName: data.districtName,
          divisionName: data.divisionName,
          hospitalName: data.hospitalName,
          fullAddress: data.fullAddress,
          donationDate: data.donationDate,
          donationTime: data.donationTime,
          requestMessage: data.requestMessage,
        },
      };
      const result = await requestCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    app.get("/donation-request-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await requestCollection.findOne(query);
      res.send(result);
    });

    app.put("/request/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedRequest = {
        $set: {
          status: data.status,
          accepterName: data.name,
          accepterEmail: data.email,
        },
      };
      const result = await requestCollection.updateOne(
        filter,
        updatedRequest,
        options
      );
      res.send(result);
    });

    app.get("/get-request-for-dashboard-home-page", async (req, res) => {
      const email = req.query.email;
      const query = { requesterEmail: email };
      const result = await requestCollection
        .find(query)
        .sort({ _id: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    app.get(
      "/get-request-for-dashboard-my-donation-requests-page",
      async (req, res) => {
        const email = req.query.email;
        const query = { requesterEmail: email };
        const result = await requestCollection.find(query).toArray();
        res.send(result);
      }
    );

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

    app.put("/update-user-status/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      console.log({ id, user });
      const options = { upsert: true };
      const updatedRequest = {
        $set: {
          status: user.status,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedRequest,
        options
      );
      res.send(result);
    });

    app.put("/update-user-role/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      console.log({ id, user });
      const options = { upsert: true };
      const updatedRequest = {
        $set: {
          role: user.role,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedRequest,
        options
      );
      res.send(result);
    });

    app.put("/update-user", async (req, res) => {
      const email = req.query.email;
      const user = req.body;
      // const filter = { _id: new ObjectId(id) };
      console.log({ img, email });
      // const options = { upsert: true };
      // const updatedRequest = {
      //   $set: {
      //     role: user.role,
      //   },
      // };
      // const result = await usersCollection.updateOne(
      //   filter,
      //   updatedRequest,
      //   options
      // );
      // res.send(result);
    });

    app.get("/verifyAdmin", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/verifyVolunteer", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // home page related api

    app.get("/feature", async (req, res) => {
      const result = await featureCollection.find().toArray();
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
