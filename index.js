const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = fakeDataCollection.find(query);
      const result = await cursor.toArray();
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
