import express from "express"
import { commentController } from "./comment.controller";
import { auth, UserRole } from "../../middlewares/auth.middleware";
const router = express.Router();

router.post('/', auth(UserRole.USER, UserRole.ADMN), commentController.createComment)

export const commentRouter = router;