import { Router } from "express";
import { upload } from "../middleware/multer.js";
import UserController from "../controller/userController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.route("/sign-up").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  UserController.createUser
);
router.route("/login").post(UserController.loginUser);

//secure route
router.route("/get-user").get(isAuthenticated, UserController.loadUser);
router.route("/logout").post(isAuthenticated, UserController.logoutUser);

export default router;
no;
