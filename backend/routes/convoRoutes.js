import express from "express";
import {createConvo,getGroups,clearChat} from "../controllers/convoController.js"
import {isAuthenticated} from "../middleware/userAuthentication.js"

const router=express.Router();

router.route("/create").post(isAuthenticated,createConvo);// this is of user to which is sent
router.route("/get/:id").get(isAuthenticated,getGroups);
//router.route("/delete/").post(isAuthenticated,deleteChat);
router.route("/clear/").post(isAuthenticated,clearChat);
// admin id is made optional by "?"

export default router;