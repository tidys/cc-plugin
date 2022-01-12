//@ts-ignore
import * as babylon from 'babylon'
//@ts-ignore
import generator from '@babel/generator'

const ExportDefaultDeclaration = 'ExportDefaultDeclaration'
const ObjectExpression = 'ObjectExpression';
const BooleanLiteral = 'BooleanLiteral'
const StringLiteral = 'StringLiteral'

class AstFinder {
    cur: any;

    constructor(ast: any) {
        this.cur = ast.program.body;
    }


    findType(type: string) {
        let ret = this.cur.find((el: any) => el.type === type);
        if (ret) {
            if (type === ExportDefaultDeclaration) {
                this.cur = ret.declaration;
            }
        } else {
            this.cur = null;
        }
        return this;
    }

    findProperty(key: string) {
        let ret = this.cur.find((el: any) => el.key.name === key);
        if (ret) {
            this.cur = ret.value;
        } else {
            this.cur = null;
        }
        return this;
    }

    isObject() {
        if (this.cur.type === ObjectExpression) {
            this.cur = this.cur.properties;
        } else {
            this.cur = null;
        }
        return this;
    }

    setBoolean(value: boolean) {
        if (this.cur.type === BooleanLiteral) {
            this.cur.value = value;
        }
    }

    setString(str: string) {
        if (this.cur.type === StringLiteral) {
            this.cur.value = str;
        }
    }
}

export default function loader(source: string) {
    const ast = babylon.parse(source, { sourceType: 'module' });

    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('server').isObject()
        .findProperty('enabled').setBoolean(false)

    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('watchBuild').setBoolean(false);

    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v2').setString('')

    new AstFinder(ast)
        .findType(ExportDefaultDeclaration).isObject()
        .findProperty('options').isObject()
        .findProperty('outputProject').isObject()
        .findProperty('v3').setString('')

    const newSource = generator(ast).code;
    return newSource;
}
