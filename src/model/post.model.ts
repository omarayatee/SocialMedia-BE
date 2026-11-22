import mongoose, { HydratedDocument } from "mongoose";

export interface IPost {
  author: mongoose.Types.ObjectId;
  content?: string;
  image?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    author: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
      maxLength: 5000,
    },
    image: {
      type: [String],
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ author: 1, createdAt: -1 });

postSchema.pre("validate", function () {
  const hasContent = Boolean(this.content?.trim());
  const hasImages = Boolean(this.image && this.image.length > 0);

  if (!hasContent && !hasImages) {
    this.invalidate("content", "Post must contain text or image");
  }
});

export const PostModel = mongoose.model<IPost>("Post", postSchema);

export type HydratedPost = HydratedDocument<IPost>;