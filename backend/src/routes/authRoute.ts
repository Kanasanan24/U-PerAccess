import express from "express";
import { signin, signup, sendToken, signout } from "../controllers/authController";

const router = express.Router();
// path
router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signout", signout);
router.post("/verify/email", sendToken);
module.exports = router;