const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./Models/user");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const userRoutes = require("./Routes/userRoutes");
const path = require('path');

const mongoURI =
  "mongodb+srv://bindrakartik64:tazQbHPsNKxybIps@deeptrace.km0n1.mongodb.net/?retryWrites=true&w=majority&appName=DeepTrace";

mongoose
  .connect(mongoURI, {
    dbName: "DeepTrace",
    useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const port = 5000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
    store: MongoStore.create({
      mongoUrl: mongoURI,
      dbName: "DeepTrace",
      collectionName: "sessions",
    }),
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Replace with your client URL
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(
    cors({
    origin: "http://localhost:5173",
    credentials: true, // If using cookies for authentication
  })
);

passport.serializeUser((user, done) => {
  console.log("Serialized User: ", user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log("Deserialized User: ", id);
  try {
    User.findById(id).then((user) => done(null, user));
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const newUser = {
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
      };

      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          done(null, user);
        } else {
          user = await User.create(newUser);
          done(null, user);
        }
      } catch (err) {
        console.log(err);
      }
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

// redirect user to google for authentication
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// google callback after authentication
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    console.log("authenticated User: ", req.user);
    res.redirect("http://localhost:5173/home");
  }
);

app.get("/home", isLoggedin, (req, res) => {
  res.send("Welcome to DeepTrace");
});

function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("http://localhost:5173/"));
});

app.use(userRoutes);

app.post("/metadata-update", (req, res) => {
  const filePath = path.resolve(__dirname, req.body.filename);
  const result = req.body.result;
  const accuracy = req.body.accuracy;

  const command = `cd "C:/Users/Kartik/Downloads/exiftool-12.97_64/exiftool-12.97_64" && exiftool -Title="This video is ${result}" -Description="Deepfake Detection Prediction: ${accuracy}%" ${filePath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Error executing ExifTool');
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).send('ExifTool encountered an error');
    }
    res.send(`Metadata updated successfully! Output: ${stdout}`);
  });

  // console.log("Metadata updated:", req.body);
  // res.send("Metadata updated successfully");
});

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
