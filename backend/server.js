import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { connectDB } from "./src/config/dbConfig.js";
import authRoutes from "./src/routes/authRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();

//middleware that sets security headers
app.use(helmet());

//cors configs
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//parse json request bodies and limit size
app.use(express.json({ limit: "10mb" }));

//parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

//check server
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Issue Tracker server is running",
  });
});

//routes
app.use("/api/auth", authRoutes);

//global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

//start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
