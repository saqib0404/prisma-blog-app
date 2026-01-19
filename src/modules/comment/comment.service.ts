import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }

    return await prisma.comment.create({
        data: payload
    })
}

const getCommentById = async (id: string) => {
    const result = await prisma.comment.findUnique({
        where: {
            id
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })
    return result
}

const getCommentByAuthor = async (id: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId: id
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
    return result
}

const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: { id: true }
    })

    if (!commentData) {
        throw new Error("Provide a valid input")
    }

    const result = await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })
    return result
}

const updateUpdate = async (
    commentId: string,
    data: { content?: string, status?: CommentStatus },
    authorId: string
) => {

    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId
        },
        select: { id: true }
    })
    if (!commentData) {
        throw new Error("Provide a valid input")
    }

    const result = await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })
    return result
}

const moderateComment = async (id: string, payload: { status: CommentStatus }) => {
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            id: true,
            status: true
        }
    })

    if (commentData.status === payload.status) {
        throw new Error(`Your Provided data (${payload.status}) is already up to date`)
    }

    return await prisma.comment.update({
        where: {
            id
        },
        data: payload
    })
}

const getMyPosts = async (authorId: string) => {
    const result = await prisma.post.findMany({
        where: {
            authorId
        }
    })
    return result
}

export const commentService = {
    createComment,
    getCommentById,
    getCommentByAuthor,
    deleteComment,
    updateUpdate,
    moderateComment,
    getMyPosts
}