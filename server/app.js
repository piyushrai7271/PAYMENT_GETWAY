import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    methods:"GET, POST, DELETE, PUT",
    credentials:true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Importing routes ..........
import userRoutes from "./routes/user.routes.js";

app.use("/api/user",userRoutes);


export default app;
