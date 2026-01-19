import { Request, Response } from "express"
import { commentService } from "./comment.service"

const createComment = async (req: Request, res: Response) => {
    try {
        req.body.authorId = req.user?.id
        const result = await commentService.createComment(req.body)
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentService.getCommentById(commentId as string)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getCommentByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params
        const result = await commentService.getCommentByAuthor(authorId as string)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { commentId } = req.params
        const result = await commentService.deleteComment(commentId as string, user?.id as string)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const updateUpdate = async (req: Request, res: Response) => {
    try {
        const user = req.user
        const { commentId } = req.params
        const result = await commentService.updateUpdate(commentId as string, req.body, user?.id as string)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const moderateComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentService.moderateComment(commentId as string, req.body)
        res.status(200).json(result)
    } catch (error: any) {
        const errorMsg = (error instanceof Error) ? error.message : "Comment Update Failed"
        res.status(400).json({
            success: false,
            message: errorMsg,
            details: error
        })
    }
}

export const commentController = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateUpdate,
    moderateComment
}