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
  res.render("animals/index.ejs", { animals });
});

// new route
app.get("/animals/new", (req, res) => {
  res.render("animals/new.ejs");
});

app.delete("/animals/:id", (req, res) => {
  // get the id from params
  const id = req.params.id;
  // delete the animal
  Animal.findByIdAndRemove(id, (err, animal) => {
    // redirect user back to index page
    res.redirect("/animals");
  });
});

//update route
app.put("/animals/:id", (req, res) => {
  // get the id from params
  const id = req.params.id;
  // check if the extinct property should be true or false
  req.body.extinct = req.body.extinct === "on" ? true : false;
  // update the animal
  Animal.findByIdAndUpdate(id, req.body, { new: true }, (err, animal) => {
    // redirect user back to main page
    console.log("update animal:", animal);
    res.redirect("/animals");
  });
});

// create route
app.post("/animals", (req, res) => {
  // check if the Extinct property is true or false
  req.body.extinct = req.body.extinct === "on" ? true : false;
  // create the new animal
  Animal.create(req.body, (err, animal) => {
    // redirect the user back to the main animals page after animal is created
    res.redirect("/animals");
  });
});

// edit route
app.get("/animals/:id/edit", (req, res) => {
  // get the id from params
  const id = req.params.id;
  // get the animal from the database
  Animal.findById(id, (err, animal) => {
    // render template and send it animal
    res.render("animals/edit.ejs", { animal });
  });
});

// show route
app.get("/animals/:id", (req, res) => {
  // get the id from params
  const id = req.params.id;
  // find the particular animal from the database
  Animal.findById(id, (err, animal) => {
    // render the template with the data from the database
    res.render("animals/show.ejs", { animal });
  });
});

//////////////////////////////////////////////
// Server Listener
//////////////////////////////////////////////
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`));
