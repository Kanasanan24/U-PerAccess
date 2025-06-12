import express from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";
const router = express.Router();
// path
router.post("/user/create", createUser);
router.get("/user/pagination", getUsers);
router.delete("/user/delete", deleteUser);
router.get("/user/id/:user_id", getUserById);
router.put("/user/update/:current_id", updateUser);
module.exports = router;