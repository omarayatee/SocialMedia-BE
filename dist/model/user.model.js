"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../common/enum");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    confirmEmail: { type: String },
    password: {
        type: String,
        required: function () {
            return this.provider == enum_1.ProviderEnum.SYSTEM;
        },
    },
    gender: {
        type: String,
        default: enum_1.GenderEnum.MALE,
        enum: enum_1.GenderEnum,
    },
    role: {
        type: String,
        default: enum_1.RoleEnum.USER,
        enum: enum_1.RoleEnum,
    },
    provider: {
        type: String,
        default: enum_1.ProviderEnum.SYSTEM,
        enum: enum_1.ProviderEnum,
    },
    phone: String,
    DOB: Date,
    image: String,
    coverImage: [String],
    changeCredentialsTime: Date,
}, {
    timestamps: true,
    strictQuery: true,
    autoIndex: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.model("User", userSchema);
