import express, { NextFunction, Request, Response } from "express"
import { PostController } from "./post.controller"
import { auth, UserRole } from "../../middlewares/auth.middleware"
const router = express.Router()

router.get("/", PostController.getAllPosts)

router.get("/stats", auth(UserRole.ADMN), PostController.getStats)

router.get("/my-posts", auth(UserRole.USER, UserRole.ADMN), PostController.getMyPosts)

router.get("/:id", PostController.getPostById)

router.post("/", auth(UserRole.USER, UserRole.ADMN), PostController.createPost)

router.patch("/:postId", auth(UserRole.USER, UserRole.ADMN), PostController.updatePost)

router.delete("/:postId", auth(UserRole.USER, UserRole.ADMN), PostController.deletePost)


export const postRouter = router