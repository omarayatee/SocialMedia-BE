 import dns from "node:dns";
  dns.setServers(["8.8.8.8"]);

  import express from "express";
  import { globalErrorHandling } from "./middleware/error.middleware";
  import { bootstrapDB } from "./DB/connection";
  import { ORIGIN, PORT } from "./config";
  import cors from "cors";
  import userController from "./modules/user/user.controller";
  import authenticationController from "./modules/authentication/authentication.controller";
  import { UserModel } from "./model";
  import { ProviderEnum } from "./common/enum";
  import followRouter from "./modules/follow/follow.controller";
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
  bootstrapDB(app, PORT);

  app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
    return res.status(200).json({ message: "Done" });
  });
  app.use("/auth", authenticationController);
  app.use("/user", userController);
  app.use("/follow", followRouter);
  app.use(globalErrorHandling);

  // async function test() {
  //   const user = new UserModel({
  //     firstName: "mahmoud",
  //     lastName: "matara",
  //     email: "mahmoohoi25@gmail.com",
  //     password: "sdjhbsd2355",
  //     provider: ProviderEnum.GOOGLE,
  //   });
  //   await user.save();
  // }

  // test();