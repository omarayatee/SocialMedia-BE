import dns from "node:dns";
dns.setServers(["8.8.8.8"]);


import express from "express";
import { authenticationController } from "./modules";
import { globalErrorHandling } from "./middleware/error.middleware";
import { PORT } from "./config";
import { bootstrapDB } from "./DB/connection";

const app: express.Application = express();
app.use(express.json());
bootstrapDB(app, PORT);

app.all("/", async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Response> => {
  return res.status(200).json({ message: "Done" });
});
app.use("/auth", authenticationController);
app.use(globalErrorHandling);