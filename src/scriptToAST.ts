import { parseComponent } from 'vue-template-compiler'
import { parse as babelParse } from '@babel/parser'

export default function scriptToAST(code: string) {
  const sfc = parseComponent(code)
  const ast = babelParse(sfc.script? sfc.script.content: '', {
    sourceType: "module",
    plugins: [
      'dynamicImport',
      'jsx'
    ]
  })
  return ast
}
