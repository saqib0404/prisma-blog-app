import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client"
import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"

const createPost = async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result
}

const getAllPosts = async (
    {
        search,
        tags,
        isFeatured,
        status,
        authorId,
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }:
        {
            search?: string | undefined,
            tags: string[] | [],
            isFeatured: boolean | undefined,
            status: PostStatus | undefined,
            authorId: string | undefined,
            page: number,
            limit: number,
            skip: number,
            sortBy: string,
            sortOrder: string
        }
) => {
    const addContitions: PostWhereInput[] = []
    if (search) {
        addContitions.push({
            OR: [
                {
                    title: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: search as string,
                        mode: "insensitive"
                    }
                },
                {
                    tags: {
                        has: search as string
                    }
                }
            ]
        })
    }

    if (tags.length > 0) {
        addContitions.push({
            tags: {
                hasEvery: tags as string[]
            }
        })
    }

    if (typeof isFeatured === "boolean") {
        addContitions.push({ isFeatured })
    }

    if (status) {
        addContitions.push({
            status
        })
    }

    if (authorId) {
        addContitions.push({
            authorId
        })
    }

    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: addContitions
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });

    const total = await prisma.post.count({
        where: {
            AND: addContitions
        }
    })
    return {
        data: result,
        pagination: {
            totalData: total,
            currentPage: page,
            dataLmit: limit,
            totalPages: Math.ceil(total / limit)
        }
    }
}

const getPostById = async (id: string) => {
    const result = await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        const postData = await tx.post.findUnique({
            where: {
                id
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: { createdAt: "desc" },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: { createdAt: "asc" },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: { createdAt: "asc" },
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        })
        return postData;
    })
    return result
}

const getStats = async () => {
    return await prisma.$transaction(async (tx) => {
        const [
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComments,
            totalUsers,
            adminCount,
            userCount,
            totalViews
        ] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
            await tx.post.count({ where: { status: PostStatus.DRAFT } }),
            await tx.post.count({ where: { status: PostStatus.ARCHEVED } }),
            await tx.comment.count(),
            await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
            await tx.user.count(),
            await tx.user.count({ where: { role: "ADMIN" } }),
            await tx.user.count({ where: { role: "USER" } }),
            await tx.post.aggregate({
                _sum: { views: true }
            })
        ])

        return {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            totalComments,
            approvedComments,
            totalUsers,
            adminCount,
            userCount,
            totalViews: totalViews._sum.views
        }
    })
}

const getMyPosts = async (authorId: string) => {
    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE"
        },
        select: {
            id: true
        }
    })

    const result = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })
    return result
}

const updatePost = async (postId: string, payload: Partial<Post>, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not the creator of the post")
    }

    if (!isAdmin) {
        delete payload.isFeatured
    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload
    })
    return result
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("You are not the creator of the post")
    }

    const result = await prisma.post.delete({
        where: {
            id: postId
        }
    })
    return result
}


export const postService = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost,
    getStats
}