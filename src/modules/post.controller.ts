import { Request, Response } from "express"
import { postService } from "./post.server"

const createPost = async (req: Request, res: Response) => {
    try {
        const result = await postService.createPost(req.body)
        res.status(201).json(result)
    } catch (error) {
        res.status(400).json({
            success: false,
            details: error
        })
    }
}

export const PostController = {
    createPost
}