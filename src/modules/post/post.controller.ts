import { Request, Response } from "express"
import { postService } from "./post.server"
import { PostStatus } from "../../../generated/prisma/enums"
import paginationSortingHelper from "../../helpers/paginationSortingHelper"
import { UserRole } from "../../middlewares/auth.middleware"

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

        const options = paginationSortingHelper(req.query)

        const result = await postService.getAllPosts
            ({
                search: searchString,
                tags,
                isFeatured,
                status,
                authorId,
                ...options
            })
        res.status(201).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) {
            throw new Error("Post Id Not Found")
        }

        const result = await postService.getPostById(id)
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getStats = async (req: Request, res: Response) => {
    try {
        const result = await postService.getStats()
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error?.name,
            details: error
        })
    }
}

const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            throw new Error("You are unauthorized")
        }
        const result = await postService.getMyPosts(user.id)
        res.status(200).json(result)
    } catch (error: any) {
        const errorMsg = (error instanceof Error) ? error.message : "posts fetched Failed"
        res.status(400).json({
            success: false,
            message: errorMsg,
            details: error
        })
    }
}

const updatePost = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            throw new Error("You are unauthorized")
        }
        const { postId } = req.params
        const isAdmin = user.role === UserRole.ADMN
        const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin)
        res.status(200).json(result)
    } catch (error: any) {
        const errorMsg = (error instanceof Error) ? error.message : "posts update Failed"
        res.status(400).json({
            success: false,
            message: errorMsg,
            details: error
        })
    }
}

const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user
        if (!user) {
            throw new Error("You are unauthorized")
        }
        const { postId } = req.params
        const isAdmin = user.role === UserRole.ADMN
        const result = await postService.deletePost(postId as string, user.id, isAdmin)
        res.status(200).json(result)
    } catch (error: any) {
        const errorMsg = (error instanceof Error) ? error.message : "posts delete Failed"
        res.status(400).json({
            success: false,
            message: errorMsg,
            details: error
        })
    }
}

export const PostController = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStats
}