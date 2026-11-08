"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
const exception_1 = require("../../common/exception");
const user_repository_1 = require("./../../common/repository/user.repository");
const cache_service_1 = __importDefault(require("../../common/service/cache.service"));
const security_1 = require("../../common/security");
const enum_1 = require("../../common/enum");
const email_1 = require("../../common/utils/email");
const otp_1 = require("./../../common/utils/otp");
const service_1 = require("../../common/service");
class AuthenticationService {
    userRepository;
    cacheService;
    tokenService;
    constructor() {
        console.log("in");
        this.userRepository = new user_repository_1.UserRepository();
        this.cacheService = cache_service_1.default;
        this.tokenService = service_1.tokenService;
    }
    async sendEmailOtp({ email, subject, expiresIn = 120, maxTrails = 3, blockInSecond = 300, }) {
        const existOtpTRl = await this.cacheService.ttl({ key: (0, email_1.UserEmailKey)({ email, subject }) });
        if (existOtpTRl > 0) {
            throw new exception_1.ConflictException(`Sorry we cannot create new otp until existing one become expired try again later after ${existOtpTRl}s`);
        }
        const oldTrails = (await this.cacheService.get({ key: (0, email_1.UserEmailTrailsKey)({ email, subject }) })) ?? 0;
        if (oldTrails >= maxTrails) {
            throw new exception_1.BadRequestException("max otp trails reached");
        }
        const code = (0, otp_1.createOtp)();
        await this.cacheService.set({ key: (0, email_1.UserEmailKey)({ email, subject }), ttl: expiresIn, value: await (0, security_1.hash)(code.toString()) });
        const currentTrails = await this.cacheService.incrBy({ key: (0, email_1.UserEmailTrailsKey)({ email, subject }) });
        if (currentTrails == maxTrails) {
            await this.cacheService.expire({ key: (0, email_1.UserEmailTrailsKey)({ email, subject }), ttl: blockInSecond });
        }
        email_1.emailEvent.emit("sendEmail", {
            recipients: { to: email },
            subject,
            data: { code },
        });
    }
    signupService = async ({ username, email, phone, gender, password }) => {
        const userExist = await this.userRepository.findOne({
            filter: { email },
        });
        console.log(userExist);
        if (userExist) {
            throw new exception_1.ConflictException("Email Exist");
        }
        const account = await this.userRepository.createOne({
            data: { username, email, phone: await (0, security_1.encryptionSecurity)(phone), gender, password: await (0, security_1.hash)(password) },
            options: { validateBeforeSave: true },
        });
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return account.toJSON();
    };
    async confirmEmailService({ otp, email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account)
            throw new exception_1.NotFoundException("Email not Exist");
        const hashOtp = await this.cacheService.get({ key: (0, email_1.UserEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) });
        if (!hashOtp || !(await (0, security_1.compare)(otp, hashOtp))) {
            throw new exception_1.ConflictException("Invalid otp");
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cacheService.del({ key: await this.cacheService.keys({ prefix: (0, email_1.UserEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) }) });
        return;
    }
    async resendConfirmEmail({ email }) {
        const account = await this.userRepository.findOne({
            filter: {
                email,
                provider: enum_1.ProviderEnum.SYSTEM,
                confirmEmail: { $exists: false },
            },
        });
        if (!account)
            throw new exception_1.NotFoundException("Email not Exist");
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async loginService({ email, password }, issuer) {
        const account = await this.userRepository.findOne({
            filter: { email, provider: enum_1.ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
        });
        if (!account)
            throw new exception_1.NotFoundException("Invalid login data");
        const match = await (0, security_1.compare)(password, account.password);
        if (!match)
            throw new exception_1.NotFoundException("Invalid login data");
        return this.tokenService.createLoginCredentials({ user: account, issuer });
    }
}
exports.AuthenticationService = AuthenticationService;
exports.default = new AuthenticationService();
