import express from "express";
import { registerUser, loginUser, changePassword } from "../controllers/authController";
import { verificarToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", /*verificarToken, */ changePassword);


export default router;
