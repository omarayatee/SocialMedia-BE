import { FollowModel, IFollow } from "../../model";
import { DatabaseRepository } from "./base.repository";

export class FollowRepository extends DatabaseRepository<IFollow> {
  constructor() {
    super(FollowModel);
  }
}