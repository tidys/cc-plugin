import { parse } from '@babel/parser'
//@ts-ignore
import generator from '@babel/generator'

const ExportDefaultDeclaration = 'ExportDefaultDeclaration'
const ObjectExpression = 'ObjectExpression';
const BooleanLiteral = 'BooleanLiteral'
const StringLiteral = 'StringLiteral'
const VariableDeclaration = 'VariableDeclaration'
const VariableDeclarator = 'VariableDeclarator'

class AstFinder {
    cur: any;

    constructor(ast: any) {
        this.cur = ast.program.body;
    }


    findType(type: string) {
        if (this.cur) {
            let ret = this.cur.filter((el: any) => el.type === type);
            if (ret) {
                if (type === ExportDefaultDeclaration) {
                    this.cur = ret.declaration;
                } else if (type === VariableDeclaration) {
                    this.cur = ret;
                }
            } else {
                this.cur = null;
        }
        }
        return this;
    }
    findVar (key:string) {
        if (this.cur) {
            for (let i = 0; i < this.cur.length; i++) {
                let item = this.cur[i];
                let ret = item.declarations.find((el: any) => {
                    return el.type === VariableDeclarator && el.id.name === key
                })
                if (ret) {
                    this.cur = ret.init;
                    return this;
                }
            }
        }
        this.cur = null;
        return this;
    }
    findProperty(key: string) {
        if (this.cur) {
            let ret = this.cur.find((el: any) => el.key.name === key);
            if (ret) {
                this.cur = ret.value;
            } else {
                this.cur = null;
            }
        }
        return this;
    }

    isObject() {
        if (this.cur && this.cur.type === ObjectExpression) {
            this.cur = this.cur.properties;
        } else {
            this.cur = null;
        }
        return this;
    }

    setBoolean(value: boolean) {
        if (this.cur && this.cur.type === BooleanLiteral) {
            this.cur.value = value;
        }
    }

    setString(str: string) {
        if (this.cur && this.cur.type === StringLiteral) {
            this.cur.value = str;
        }
    }
}

export default function loader(source: string) {
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript'] });

    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('server').isObject()
        .findProperty('enabled').setBoolean(false)

    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('watchBuild').setBoolean(false);

    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v2').setString('')

    new AstFinder(ast)
        .findType(VariableDeclaration)
        .findVar('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v3').setString('')

    const newSource = generator(ast).code;
    return newSource;
}
