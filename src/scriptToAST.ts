import { parseComponent } from 'vue-template-compiler'
import { parse as babelParse } from '@babel/parser'
import * as t from '@babel/types'

export function defaultParse (script: string) {
  return babelParse(script, {
    sourceType: 'module',
    plugins: [
      'dynamicImport',
      'jsx'
    ]
  })
}

export default function scriptToAST (code: string): t.File {
  const sfc = parseComponent(code)
  const ast = defaultParse(sfc.script ? sfc.script.content : '')
  return ast
}
