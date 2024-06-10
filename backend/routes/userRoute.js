import express from "express";
import { register,login,logout,getOtherUsers } from "../controllers/userController.js";
import {isAuthenticated} from "../middleware/userAuthentication.js"

const router=express.Router();

router.route("/register").post(register);
router.route("/login").post(login); // why this method is post api-> becoz while logging we are saving token in cookiers
router.route("/logout").get(logout); // why get 
router.route("/").get(isAuthenticated,getOtherUsers); // in home vale me hi iss router ko hitt krna chaht h

export default router;