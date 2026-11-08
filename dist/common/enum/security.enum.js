"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutEnum = exports.LanguageEnum = exports.TokenTypeEnum = void 0;
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    TokenTypeEnum[TokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
;
var LanguageEnum;
(function (LanguageEnum) {
    LanguageEnum[LanguageEnum["AR"] = 0] = "AR";
    LanguageEnum[LanguageEnum["EN"] = 1] = "EN";
})(LanguageEnum || (exports.LanguageEnum = LanguageEnum = {}));
var logoutEnum;
(function (logoutEnum) {
    logoutEnum[logoutEnum["DEVICE"] = 0] = "DEVICE";
    logoutEnum[logoutEnum["ALL"] = 1] = "ALL";
})(logoutEnum || (exports.logoutEnum = logoutEnum = {}));
;
