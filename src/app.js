import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//for json data
app.use(
  express.json({
    limit: "16kb",
  })
);

//for data from url
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

//for assets
app.use(express.static("public"));

app.use(cookieParser());

//routes
import userRouter from "./routes/user.routes.js";
//routes declaration--->not app.get('')as now it behaves like a middleware so app.use
app.use("/api/v1/users", userRouter);
//api/v1/users/register

export default app;
