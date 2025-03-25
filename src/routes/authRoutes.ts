import express from "express";
import { registerUser, loginUser, changePassword } from "../controllers/usuario/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/change-password", /*verificarToken, */ changePassword);


export default router;
