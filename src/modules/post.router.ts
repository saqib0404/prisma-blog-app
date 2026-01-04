import express, { NextFunction, Request, Response } from "express"
import { PostController } from "./post.controller"
import { auth, UserRole } from "../middlewares/auth.middleware"
const router = express.Router()



router.post("/", auth(UserRole.USER), PostController.createPost)

export const postRouter = router