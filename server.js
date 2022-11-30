/////////////////////////////////////////////
// Import Our Dependencies
/////////////////////////////////////////////
require("dotenv").config(); // Load ENV Variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const methodOverride = require("method-override");
const mongoose = require("mongoose");

/////////////////////////////////////////////
// Database Connection
/////////////////////////////////////////////
// Setup inputs for our connect function
const DATABASE_URL = process.env.DATABASE_URL;
const CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Establish Connection
mongoose.connect(DATABASE_URL, CONFIG);

// Events for when connection opens/disconnects/errors
mongoose.connection
  .on("open", () => console.log("Connected to Mongoose"))
  .on("close", () => console.log("Disconnected from Mongoose"))
  .on("error", (error) => console.log(error));

////////////////////////////////////////////////
// Our Models
////////////////////////////////////////////////
// pull schema and model from mongoose
const { Schema, model } = mongoose;

// make animals schema
const animalsSchema = new Schema({
  species: String,
  location: String,
  extinct: Boolean,
  lifeExpectancy: Number,
});

// make animal model
const Animal = model("Animal", animalsSchema);

/////////////////////////////////////////////////
// Create our Express Application Object
/////////////////////////////////////////////////
const app = express();

/////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////
app.use(morgan("tiny")); //logging
app.use(methodOverride("_method")); // override for put and delete requests from forms
app.use(express.urlencoded({ extended: true })); // parse urlencoded request bodies
app.use(express.static("public")); // serve files from public statically

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("your server is running... better catch it.");
});

app.get("/animals/seed", (req, res) => {
  // array of starter animal - definie data we want to put in the database
  const startAnimals = [
    { species: "cat", location: "egypt", extinct: false, lifeExpectancy: 10 },
    { species: "dog", location: "siberia", extinct: false, lifeExpectancy: 11 },
    {
      species: "Woolly Mammoth",
      location: "Africa",
      extinct: true,
      lifeExpectancy: 60,
    },
    {
      species: "dinosaur",
      location: "South America",
      extinct: true,
      lifeExpectancy: 50,
    },
    {
      species: "toucan",
      location: "Mexico",
      extinct: false,
      lifeExpectancy: 20,
    },
  ];

  // Delete all animals
  Animal.deleteMany({}, (err, data) => {
    // Seed Starter Animals - create new animals once old animals are deleted
    Animal.create(startAnimals, (err, data) => {
      // send created aniamls as response to confirm creation
      res.json(data);
    });
  });
});

// index route - Get all animals from mongo and send them back
app.get("/animals", async (req, res) => {
  const animals = await Animal.find({});
  res.json(animals);
});

//////////////////////////////////////////////
// Server Listener
//////////////////////////////////////////////
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`));
