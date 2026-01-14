import { Request, Response } from "express"
import { commentService } from "./comment.service"

const createComment = async (req: Request, res: Response) => {
    try {
        req.body.authorId = req.user?.id
        const result = await commentService.createPost(req.body)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

export const commentController = {
    createComment
}