import dns from "node:dns";
dns.setServers(["8.8.8.8"]);

import express from "express";
import { globalErrorHandling } from "./middleware/error.middleware";
import { bootstrapDB } from "./DB/connection";
import { ORIGIN, PORT } from "./config";
import cors from "cors";
import userController from "./modules/user/user.controller";
import authenticationController from "./modules/authentication/authentication.controller";
import postRouter from "./modules/post/post.controller";
import friendRouter from "./modules/friend/friend.controller";
import { notificationService } from "./common/service";

const app: express.Application = express();

var corsOptions = {
  origin: function (origin: string, callback: Function) {
    if (!ORIGIN.includes(origin)) {
      callback(new Error("Unauthorized origin", { cause: { status: 401 } }), ORIGIN);
    } else {
      callback(null, ORIGIN);
    }
  },
};

app.use(cors(), express.json());
app.use("/assets", express.static("./assets"));
bootstrapDB(app, PORT);

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
  return res.status(200).json({ message: "Done" });
});
app.post("/send-notification", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
  const token = req.body.token;
  await notificationService.sendNotification({
    token,
    notification: { title: "TEST NOTIFICATION SOCIAL_APP", body: "WELCOME TO HOME" },
  });
  console.log({ token });

  return res.status(200).json({ message: "Done" });
});
app.use("/auth", authenticationController);
app.use("/user", userController);
app.use("/post", postRouter);
app.use("/friend", friendRouter);
app.use(globalErrorHandling);