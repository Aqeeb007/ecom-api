import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import connect from "./db/index.js";
import morgan from "morgan";

dotenv.config({
  path: "./.env",
});
const app = express();

connect();

// middlewares
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("combined"));


//import routes
import userRoutes from "./routers/userRoutes.js";
import sellerRoutes from "./routers/sellerRoutes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/sellers", sellerRoutes);

app.all("*", (req, res, next) => {
  res.status(404).json({ error: true, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode).json({
    error: true,
    message: err.message,
    statusCode: err.statusCode,
  });
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
});
