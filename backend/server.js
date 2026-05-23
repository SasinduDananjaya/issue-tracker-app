import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/dbConfig.js";
import authRoutes from "./src/routes/authRoutes.js";
import issueRoutes from "./src/routes/issueRoutes.js";
import activityRoutes from "./src/routes/activityRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import requestLogger from "./src/middleware/requestLogger.js";

const app = express();

//middleware that sets security headers
app.use(helmet());

//log the incoming req
app.use(requestLogger);

//cors configs
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, //browser to send httpOnly cookies cross-origin
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//parse httpOnly refresh token cookie
app.use(cookieParser());

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
app.use("/api/issues", issueRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/users", userRoutes);

//global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

//start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
