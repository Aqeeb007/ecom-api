import { Router } from "express";
import { upload } from "../middleware/multer.js";
import SellerController from "../controller/sellerController.js";
import { isSeller } from "../middleware/auth.js";

const router = Router();

router.route("/sign-up").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  SellerController.createSeller
);

router.route("/login").post(SellerController.loginSeller);

//secure route
router.route("/get-user")
.get(isSeller, SellerController.loadSeller);
router.route("/logout").post(isSeller, SellerController.logoutSeller);


export default router;
