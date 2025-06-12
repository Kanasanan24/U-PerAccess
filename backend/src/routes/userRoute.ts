import express from "express";
import { createUser } from "../controllers/userController.js";
const router = express.Router();
// path
router.post("/user/create", createUser);
module.exports = router;