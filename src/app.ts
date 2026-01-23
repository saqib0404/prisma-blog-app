import express, { Application } from "express"
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { postRouter } from "./modules/post/post.router";
import { commentRouter } from "./modules/comment/comment.router";
import errorHandler from "./middlewares/globalErrorEandler";

const app: Application = express();

app.use(express.json())
app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
}))

app.all('/api/auth/{*any}', toNodeHandler(auth));


// Posts
app.use("/posts", postRouter)

app.use("/comments", commentRouter)

app.use(errorHandler)

export { app }