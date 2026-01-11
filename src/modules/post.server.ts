import { Post, PostStatus } from "../../generated/prisma/client";
import { PostWhereInput } from "../../generated/prisma/models";
import { prisma } from "../lib/prisma";

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
        authorId
    }:
        {
            search?: string | undefined,
            tags: string[] | [],
            isFeatured: boolean | undefined,
            status: PostStatus | undefined,
            authorId: string | undefined
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
        where: {
            AND: addContitions
        }
    });
    return result
}

export const postService = {
    createPost,
    getAllPosts
}