const {Router } = require("express");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const UserController = require("../controllers/UserController");
const UserAvatarController = require("../controllers/UserAvatarController");
const uploadConfig = require("../configs/upload");
const multer = require("multer")

const userRoutes = Router();
const upload = multer(uploadConfig.MULTER);
const userController = new UserController();
const userAvatarController = new UserAvatarController();

userRoutes.post("/", userController.create);
userRoutes.put("/", ensureAuthenticated, userController.update);
userRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update)

module.exports = userRoutes;