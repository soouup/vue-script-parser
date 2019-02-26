import * as fs from 'fs'
import scriptToAST from './scriptToAST'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import * as path from 'path'
import ComponentInfo, { Dependence, ImportSpecifer } from './ComponentInfo'
(function (file: string) {
  const code = fs.readFileSync(file, 'utf-8')
  const ast = scriptToAST(code)

  debugger
  const dependencies: Array<Dependence> = []
  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value
      const specifiers: Array<ImportSpecifer> = path.node.specifiers.map(s => {
        return {
          type: s.type,
          name: s.local.name
        }
      })
      const dep: Dependence = {
        source,
        specifiers,
        comment: ''
      }
      dependencies.push(dep)
    }
  })
  const ci:ComponentInfo = {
    comment:'',
    name:'',
    dependencies
  }
  debugger
  console.log(ci)
})(path.join(__dirname, '..', 'toRead.vue'))