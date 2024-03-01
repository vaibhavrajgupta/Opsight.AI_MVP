import app from "./app.js";
import { connectToDB } from "../domain/db/index.js";
import http from "http";
import dotenv from "dotenv";

dotenv.config({
  path: "./env"
});

const port = process.env.PORT;
const server = http.createServer(app);

connectToDB().then(() => {
  server.listen(port, () => {
    console.log(`Server Started at the ${port}`);
  });
});
