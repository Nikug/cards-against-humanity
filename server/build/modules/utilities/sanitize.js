"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = void 0;
const sanitize_1 = __importDefault(require("sanitize"));
const sanitizer = sanitize_1.default();
const sanitizeString = (value, maxLength) => {
    const shortened = value.substr(0, maxLength);
    const clean = sanitizer.value(shortened, "str");
    return clean;
};
exports.sanitizeString = sanitizeString;
