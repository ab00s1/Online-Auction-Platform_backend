const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "my_secret_key";

mongoose.connect("mongodb://localhost:27017/AuctionPlatform");

const itemSchema = new mongoose.Schema(
  {
    _id: Number,
    itemName: String,
    description: String,
    currentBid: Number,
    highestBidder: String,
    endingTime: Date,
    isClosed: { type: Boolean, default: false },
    creator: String,
  },
  { collection: "ItemList" }
);

const Item = mongoose.model("ItemList", itemSchema, "ItemList");

app.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    console.log(items);
    res.json(items);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/post-item", async (req, res) => {
  try {
    const {
      _id,
      itemName,
      description,
      currentBid,
      highestBidder,
      isClosed,
      endingTime,
      creator,
    } = req.body;

    const newItem = new Item({
      _id,
      itemName,
      description,
      currentBid,
      highestBidder,
      isClosed,
      endingTime,
      creator,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    city: String,
    state: String,
    zip: String,
    pass: String,
  },
  { collection: "UserList" }
);

const User = mongoose.model("UserList", userSchema, "UserList");

app.post("/SignUp", async (req, res) => {
  try {
    const { fullName, email, city, state, zip, pass } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(pass, 10); // Store hashed password in a real app
    const newUser = new User({
      fullName,
      email,
      city,
      state,
      zip,
      pass: hashedPassword,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const currentUserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    city: String,
    state: String,
    zip: String,
  },
  { collection: "CurrentUser" }
);

const CurrentUser = mongoose.model(
  "CurrentUser",
  currentUserSchema,
  "CurrentUser"
);

app.post("/SignIn", async (req, res) => {
  try {
    const { email, pass } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(pass, user.pass);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //  Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    //  Remove previous current user (if any)
    await CurrentUser.deleteMany({});

    //  Save the new current user
    const currentUser = new CurrentUser({
      fullName: user.fullName,
      email: user.email,
      city: user.city,
      state: user.state,
      zip: user.zip,
    });

    await currentUser.save();

    res.status(200).json({
      message: "Login successful",
      token,
      user: currentUser,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(403).json({ message: "Access denied, token missing" });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.user = verified; // Attach user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/protected-route", authenticateToken, async (req, res) => {
  res.json({ message: "You have accessed a protected route!", user: req.user });
});

app.put("/update-bid", async (req, res) => {
  try {
    const { itemID, bidAmount, highestBidder } = req.body;
    if (!itemID || !bidAmount || !highestBidder) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const item = await Item.findOne({ _id: itemID });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const currentTime = new Date();
    if (new Date(item.endingTime) < currentTime) {
      item.isClosed = true;
      await item.save();
      return res.status(400).json({ message: "Bidding is closed for this item", item });
    }

    if (item.isClosed || new Date(item.endingTime) < new Date()) {
      return res.status(400).json({ message: "Bidding is closed for this item" });
    }

    if (bidAmount <= item.currentBid) {
      return res.status(400).json({ message: "Bid must be higher than current bid" });
    }

    item.currentBid = bidAmount;
    item.highestBidder = highestBidder;

    await item.save();
    res.json({ message: "Bid updated successfully", item });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/delete-item/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Item.findOneAndDelete({ _id: id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully", deletedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/edit-item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, description, currentBid, highestBidder, endingTime, isClosed, creator } = req.body;

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id },
      { itemName, description, currentBid, highestBidder, endingTime, isClosed, creator },
      { new: true }       // Returns the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully", updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001);
