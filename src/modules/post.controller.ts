import { Request, Response } from "express"
import { postService } from "./post.server"
import { PostStatus } from "../../generated/prisma/enums"

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

        const tags = req.query.tags ? (req.query.tags as string).split(",") : []

        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                    ? false
                    : undefined
            : undefined

        const status = req.query.status as PostStatus | undefined

        const authorId = req.query.authorId as string | undefined

        const result = await postService.getAllPosts({ search: searchString, tags, isFeatured, status, authorId })
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