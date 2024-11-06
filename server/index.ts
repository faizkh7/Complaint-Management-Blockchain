import express from "express";
import cors from "cors";
import http from "http";
import { configDotenv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import middleware from "./middleware";
import userRoutes from './routes/user-route';
const compile = require('./ethereum/compile');
const deploy = require('./ethereum/deploy');

configDotenv();

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middleware);

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.post("/compile", async (req, res) => {
  try {
    const compiled = compile();
    res.json(compiled);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/deploy", async (req, res) => {
  const result = await deploy();
  res.send(JSON.parse(result).address);
});

app.use('/user', userRoutes);