import { Request, Response } from "express"
import { postService } from "./post.server"

const createPost = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized!"
            })
        }
        const result = await postService.createPost(req.body, req.user.id)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        const searchString = typeof search === "string" ? search : undefined
        const result = await postService.getAllPosts({ search: searchString })
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

export const PostController = {
    createPost,
    getAllPosts
}