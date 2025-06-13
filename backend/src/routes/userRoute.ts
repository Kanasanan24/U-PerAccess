import express from "express";
// middleware
import {
    verifyAuth,
    verifyPermissions
} from "../middlewares/authToken.js";
// controller
import {
    createUser,
    deleteUser,
    getUserById,
    getUsers,
    updateUser
} from "../controllers/userController.js";

const router = express.Router();
// path
router.post("/user/create", verifyAuth, verifyPermissions(["create_user"]), createUser);
router.get("/user/pagination", verifyAuth, verifyPermissions(["find_user"]), getUsers);
router.delete("/user/delete", verifyAuth, verifyPermissions(["delete_user"]), deleteUser);
router.get("/user/id/:user_id", verifyAuth, verifyPermissions(["find_user"]), getUserById);
router.put("/user/update/:current_id", verifyAuth, verifyPermissions(["update_user"]), updateUser);
module.exports = router;