const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dp8wnte.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const fakeDataCollection = client.db("travelReview").collection("fakeData");
    const fakeReviewCollection = client
      .db("travelReview")
      .collection("fakeReview");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // get last 3 data only
    app.get("/fake", async (req, res) => {
      const query = {};
      const cursor = fakeDataCollection
        .find(query)
        .sort({ _id: -1 })
        .limit(3, function (e, d) {});
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all services data
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = fakeDataCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //get specific services data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await fakeDataCollection.findOne(query);
      res.send(service);
    });

    //add a new service
    app.post("/addService", async (req, res) => {
      const doc = req.body;
      const addService = await fakeDataCollection.insertOne(doc);
      res.send(addService);
    });

    //insert data in review
    app.post("/review", async (req, res) => {
      const doc = req.body;
      const review = await fakeReviewCollection.insertOne(doc);
      res.send(review);
    });

    //get all data from review
    app.get("/reviews/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const query = { serviceId: serviceId };
      const cursor = fakeReviewCollection.find(query).sort({ _id: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //get reviews data according to user
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }

      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = fakeReviewCollection.find(query).sort({ _id: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //delete reviews from my review
    app.delete("/deleteReviews/:id", async (req, res) => {
      const reviewId = req.params.id;
      const query = { _id: ObjectId(reviewId) };
      const deleteReview = await fakeReviewCollection.deleteOne(query);
      res.send(deleteReview);
    });

    //get individual reviews by id
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const getReview = await fakeReviewCollection.findOne(query);
      res.send(getReview);
    });

    //update a review
    app.put("/updateReview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const doc = req.body;
      const updateDoc = {
        $set: {
          review: doc.review,
        },
      };
      const options = { upsert: true };
      const result = await fakeReviewCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch((e) => console.log(e));

app.get("/", (req, res) => {
  res.send("review server running");
});

app.listen(port, () => {
  console.log(`review server running on: ${port}`);
});
