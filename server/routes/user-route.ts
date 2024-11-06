import multer from "multer";
import { register, login, createComplaint, getUserComplaints, getUnresolvedComplaints, resolveComplaint, replyComplaint, accessComplaint, complaintById } from "../controllers/user-controller";
import express from "express";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRoutes = express.Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.post("/complaint", upload.single("file"), createComplaint);
userRoutes.get("/complaints", getUserComplaints);
userRoutes.get("/unresolved-complaints", getUnresolvedComplaints);
userRoutes.post("/resolve-complaint/:id", resolveComplaint);
userRoutes.post("/reply-complaint/:id", replyComplaint);
userRoutes.get("/access-complaint/:id", accessComplaint);
userRoutes.get("/complaint/:id", complaintById);

export default userRoutes;