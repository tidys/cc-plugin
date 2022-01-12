"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-ignore
const babylon = __importStar(require("babylon"));
//@ts-ignore
const generator_1 = __importDefault(require("@babel/generator"));
const ExportDefaultDeclaration = 'ExportDefaultDeclaration';
const ObjectExpression = 'ObjectExpression';
const BooleanLiteral = 'BooleanLiteral';
const StringLiteral = 'StringLiteral';
class AstFinder {
    constructor(ast) {
        this.cur = ast.program.body;
    }
    findType(type) {
        let ret = this.cur.find((el) => el.type === type);
        if (ret) {
            if (type === ExportDefaultDeclaration) {
                this.cur = ret.declaration;
            }
        }
        else {
            this.cur = null;
        }
        return this;
    }
    findProperty(key) {
        let ret = this.cur.find((el) => el.key.name === key);
        if (ret) {
            this.cur = ret.value;
        }
        else {
            this.cur = null;
        }
        return this;
    }
    isObject() {
        if (this.cur.type === ObjectExpression) {
            this.cur = this.cur.properties;
        }
        else {
            this.cur = null;
        }
        return this;
    }
    setBoolean(value) {
        if (this.cur.type === BooleanLiteral) {
            this.cur.value = value;
        }
    }
    setString(str) {
        if (this.cur.type === StringLiteral) {
            this.cur.value = str;
        }
    }
}
function loader(source) {
    const ast = babylon.parse(source, { sourceType: 'module' });
    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('server').isObject()
        .findProperty('enabled').setBoolean(false);
    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('watchBuild').setBoolean(false);
    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v2').setString('');
    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v3').setString('');
    const newSource = generator_1.default(ast).code;
    return newSource;
}
exports.default = loader;
