import express from "express";
import {sendMessage , getMessage} from "../controllers/messageController.js"
import {isAuthenticated} from "../middleware/userAuthentication.js"

const router=express.Router();

router.route("/send/:id").post(isAuthenticated,sendMessage);// this is of user to which is sent
router.route("/:id").get(isAuthenticated,getMessage); // here when user will do login then get all msg between that and one with :id passed inn params
// since authenticated hoga , tabhi messaage kr payega as only then req.id me userid aayegi sender and tbhi send message api ka funcitons chl payega
export default router;