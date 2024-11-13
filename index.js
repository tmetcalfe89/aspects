require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const AspectModel = require("./models/Aspect");
const MixModel = require("./models/Mix");
const mongoose = require("mongoose");
const uniqolor = require("uniqolor");

const { PORT = 3000, MONGO_URI } = process.env;
if (!MONGO_URI) {
  throw new Error("Please provide a MONGO_URI in your .env file.")
}

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/imgs/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { img } = await AspectModel.findOne({ name });
    const imgBuffer = Buffer.from(img, 'base64');
    res.writeHead(200, {
      'Content-Length': imgBuffer.length
    });
    res.end(imgBuffer);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/api/aspects", async (req, res) => {
  try {
    const aspects = await AspectModel.find({}, { name: 1 }).sort({ name: 1 });
    res.json(aspects);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/api/aspects", upload.single("img"), async (req, res) => {
  try {
    const newAspect = await AspectModel.create({
      ...req.body,
      img: req.file.buffer.toString('base64')
    });
    res.json(newAspect);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/api/mixes/:inputs", async (req, res) => {
  try {
    const inputs = req.params.inputs.split(",").sort();
    const mix = await MixModel.findOne({ inputs });
    res.json(mix?.outputs || []);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/api/mixes", async (req, res) => {
  try {
    const mixes = await MixModel.find({});
    res.json(mixes.map((mix) => ({ ...mix._doc, color: uniqolor(mix.id, { lightness: 75, saturation: 70 }).color })));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post("/api/mixes", async (req, res) => {
  try {
    const { inputs, outputs } = req.body;
    inputs.sort();
    outputs.sort();
    let mix = await MixModel.findOne({ inputs });
    if (!mix) {
      mix = await MixModel.create({ inputs });
    }
    mix.outputs = outputs;
    await mix.save();
    res.json(mix);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.info(`Aspects server listening on port ${PORT} at http://localhost:${PORT}`)
});
mongoose.connect(MONGO_URI);