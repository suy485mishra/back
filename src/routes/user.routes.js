import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  //injecting middleare
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
//verifJWT to phle run krana chahta hun ki token h bhi ki n
//verifyJWT phle run hoga phir next() krne ki wjah se logout run hoga
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
