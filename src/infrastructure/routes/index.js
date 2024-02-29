import { Router } from "express";
import authentication from "./authentication.js";

const router = Router();

router.use('/auth', authentication);

export default router;