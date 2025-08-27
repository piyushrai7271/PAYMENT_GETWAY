import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Importing routes ..........
import userRoutes from "./routes/user.routes.js";

app.use("/api/user",userRoutes);


export default app;
