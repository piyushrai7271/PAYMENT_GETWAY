import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4500, ()=>{
        console.log(`✅ Server is running on port : ${process.env.PORT || 4500}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
  });
