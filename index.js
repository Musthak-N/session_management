const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redis = require("ioredis"); // Adjust host and port if needed
const cors = require("cors");
const PORT = process.env.PORT || 6661;

const redisClient = redis.createClient({
 enable_offline_queue: false,
 //  password: "SBH_PROJECT",
 URL: "redis://red-cp0b81a1hbls73e7b1cg:6379",
 //  port: 6379,
 //  host: "redis://red-cp0b81a1hbls73e7b1cg:6379",
 //  port: 6379,
});
redisClient.on("error", (err) => {
 console.log(err);
 // this error is handled by an error handling function
 return new Error();
});
redisClient.on("connect", () => {
 console.log("Connected to Redis server");
});

const sessionMiddleware = session({
 store: new RedisStore({ client: redisClient }),
 secret: "your_secret_key", // Replace with a strong, unique secret key
 resave: false, // Don't resave sessions that haven'が見えていない(mieteinai - invisible)
 saveUninitialized: false, // Save new sessions, even if empty
 cookie: {
  secure: true, // Set to true for HTTPS environments
  httpOnly: false,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
 },
});
const corsOptions = {
 origin: ["https://smazer-3810a.web.app/"],
 credentials: true, //access-control-allow-credentials:true
 //  preflightContinue,
};
const app = express();
app.use(cors(corsOptions));
app.use(sessionMiddleware);
app.set("trust proxy", 1);
app.use(function (req, res, next) {
 res.header("Access-Control-Allow-Origin", "https://smazer-3810a.web.app/");
 res.header("Access-Control-Allow-Credentials", true);
 res.header("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
 res.header(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept"
 );
 next();
});
// Other middleware and routes
app.post("/login", (req, res) => {
 console.log("login===>", req.session);
 req.session.user = { id: 1, username: "alice" }; // Example session data
 res.send("Logged in successfully!");
});
app.get("/profile", (req, res) => {
 console.log("profile details=>!", req.session.user);
 if (req.session.user) {
  res.send(`Welcome, ${req.session.user.username}!`);
 } else {
  res.send("Please log in to view your profile.");
 }
});

app.get("/logout", (req, res) => {
 req.session.destroy(); // Clear session data
 res.send("Logged out successfully!");
});

app.listen(6661, () => {
 console.log(`Server listening on http://${PORT}`);
});
