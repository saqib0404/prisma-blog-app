import express, { Application } from "express"
import { toNodeHandler } from "better-auth/node";
import { postRouter } from "./modules/post.router";
import { auth } from "./lib/auth";
import cors from "cors";

const app: Application = express();

app.use(express.json())
app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
}))

app.all('/api/auth/{*any}', toNodeHandler(auth));


// Posts
app.use("/posts", postRouter)

export { app }