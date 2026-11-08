import { ConfirmEmailDto, LoginDto, ResendConfirmEmailDto, SignupDto } from "./dto/authentication.dto";
import { IUser } from "../../common/interface";
import { HydratedUser } from "../../model";
import { BadRequestException, ConflictException, NotFoundException } from "../../common/exception";
import { UserRepository } from "./../../common/repository/user.repository";
import cacheServiceInstance, { CacheService } from "../../common/service/cache.service";
import { compare, encryptionSecurity, hash } from "../../common/security";
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum";
import { emailEvent, UserEmailKey, UserEmailTrailsKey } from "../../common/utils/email";
import { createOtp } from "./../../common/utils/otp";
import { tokenService, TokenService } from "../../common/service";
import { ILoginResponse } from "./entities/authentication.entities";

export class AuthenticationService {
  private userRepository: UserRepository;
  private cacheService: CacheService;
  private tokenService: TokenService;
  constructor() {
    console.log("in");
    this.userRepository = new UserRepository();
    this.cacheService = cacheServiceInstance;
    this.tokenService = tokenService;
  }

  async sendEmailOtp({
    email,
    subject,
    expiresIn = 120,
    maxTrails = 3,
    blockInSecond = 300,
  }: {
    email: string;
    subject: EmailSubjectEnum;
    expiresIn?: number;
    maxTrails?: number;
    blockInSecond?: number;
  }) {
    const existOtpTRl = await this.cacheService.ttl({ key: UserEmailKey({ email, subject }) });
    if (existOtpTRl > 0) {
      throw new ConflictException(`Sorry we cannot create new otp until existing one become expired try again later after ${existOtpTRl}s`);
    }

    const oldTrails = (await this.cacheService.get({ key: UserEmailTrailsKey({ email, subject }) })) ?? 0;
    if (oldTrails >= maxTrails) {
      throw new BadRequestException("max otp trails reached");
    }
    const code = createOtp();
    await this.cacheService.set({ key: UserEmailKey({ email, subject }), ttl: expiresIn, value: await hash(code.toString()) });

    const currentTrails = await this.cacheService.incrBy({ key: UserEmailTrailsKey({ email, subject }) });
    if (currentTrails == maxTrails) {
      await this.cacheService.expire({ key: UserEmailTrailsKey({ email, subject }), ttl: blockInSecond });
    }
    emailEvent.emit("sendEmail", {
      recipients: { to: email },
      subject,
      data: { code },
    });
  }
  signupService = async ({ username, email, phone, gender, password }: SignupDto["body"]): Promise<IUser> => {
    // await this.cacheservice.set({ key: "name", value: "matara" });

    const userExist = await this.userRepository.findOne({
      filter: { email },
    });
    console.log(userExist);
    if (userExist) {
      throw new ConflictException("Email Exist");
    }

    const account: HydratedUser = await this.userRepository.createOne({
      data: { username, email, phone: await encryptionSecurity(phone), gender, password: await hash(password) },
      options: { validateBeforeSave: true },
    });
    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return account.toJSON();
  };
  async confirmEmailService({ otp, email }: ConfirmEmailDto): Promise<void> {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });
    if (!account) throw new NotFoundException("Email not Exist");

    const hashOtp = await this.cacheService.get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) });

    if (!hashOtp || !(await compare(otp, hashOtp))) {
      throw new ConflictException("Invalid otp");
    }
    account.confirmEmail = new Date() as unknown as string;
    await account.save();
    await this.cacheService.del({ key: await this.cacheService.keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) });
    return;
  }
  async resendConfirmEmail({ email }: ResendConfirmEmailDto): Promise<void> {
    const account = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.SYSTEM,
        confirmEmail: { $exists: false },
      },
    });

    if (!account) throw new NotFoundException("Email not Exist");

    await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL });
    return;
  }
  async loginService({ email, password }: LoginDto, issuer: string): Promise<ILoginResponse> {
    const account = await this.userRepository.findOne({
      filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
    });

    if (!account) throw new NotFoundException("Invalid login data");

    const match = await compare(password, account.password);
    if (!match) throw new NotFoundException("Invalid login data");
    return this.tokenService.createLoginCredentials({ user: account, issuer });
  }
}

export default new AuthenticationService();