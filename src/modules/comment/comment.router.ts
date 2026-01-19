import express from "express"
import { commentController } from "./comment.controller";
import { auth, UserRole } from "../../middlewares/auth.middleware";
const router = express.Router();

router.get("/author/:authorId", commentController.getCommentByAuthor)

router.get("/:commentId", commentController.getCommentById)

router.post('/', auth(UserRole.USER, UserRole.ADMN), commentController.createComment)

router.patch('/:commentId', auth(UserRole.USER, UserRole.ADMN), commentController.updateUpdate)

router.patch('/moderate/:commentId', auth(UserRole.ADMN), commentController.moderateComment)

router.delete("/:commentId", auth(UserRole.USER, UserRole.ADMN), commentController.deleteComment)

export const commentRouter = router;