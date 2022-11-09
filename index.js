const express = require("express");
const cors = require("cors");
require("dotenv").config();
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

async function run() {
  try {
    const fakeDataCollection = client.db("travelReview").collection("fakeData");
    const fakeReviewCollection = client
      .db("travelReview")
      .collection("fakeReview");

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
