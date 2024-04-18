"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("@babel/parser");
//@ts-ignore
const generator_1 = __importDefault(require("@babel/generator"));
const ExportDefaultDeclaration = 'ExportDefaultDeclaration';
const ObjectExpression = 'ObjectExpression';
const BooleanLiteral = 'BooleanLiteral';
const StringLiteral = 'StringLiteral';
const VariableDeclaration = 'VariableDeclaration';
const VariableDeclarator = 'VariableDeclarator';
class AstFinder {
    constructor(ast) {
        this.cur = ast.program.body;
    }
    findType(type) {
        if (this.cur) {
            let ret = this.cur.filter((el) => el.type === type);
            if (ret) {
                if (type === ExportDefaultDeclaration) {
                    this.cur = ret.declaration;
                }
                else if (type === VariableDeclaration) {
                    this.cur = ret;
                }
            }
            else {
                this.cur = null;
            }
        }
        return this;
    }
    findVar(key) {
        if (this.cur) {
            for (let i = 0; i < this.cur.length; i++) {
                let item = this.cur[i];
                let ret = item.declarations.find((el) => {
                    return el.type === VariableDeclarator && el.id.name === key;
                });
                if (ret) {
                    this.cur = ret.init;
                    return this;
                }
            }
        }
        this.cur = null;
        return this;
    }
    findProperty(key) {
        if (this.cur) {
            let ret = this.cur.find((el) => el.key.name === key);
            if (ret) {
                this.cur = ret.value;
            }
            else {
                this.cur = null;
            }
        }
        return this;
    }
    isObject() {
        if (this.cur && this.cur.type === ObjectExpression) {
            this.cur = this.cur.properties;
        }
        else {
            this.cur = null;
        }
        return this;
    }
    setBoolean(value) {
        if (this.cur && this.cur.type === BooleanLiteral) {
            this.cur.value = value;
        }
    }
    setString(str) {
        if (this.cur && this.cur.type === StringLiteral) {
            this.cur.value = str;
        }
    }
}
function loader(source) {
    const ast = (0, parser_1.parse)(source, { sourceType: 'module', plugins: ['typescript'] });
    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('server').isObject()
        .findProperty('enabled').setBoolean(false);
    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('watchBuild').setBoolean(false);
    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v2').setString('');
    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v3').setString('');
    const newSource = (0, generator_1.default)(ast).code;
    return newSource;
}
exports.default = loader;
//# sourceMappingURL=cc-plugin-config.loader.js.map