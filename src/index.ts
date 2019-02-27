import * as fs from 'fs'
import * as path from 'path'

import traverse, { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'

import scriptToAST from './scriptToAST'
import { getConcatedComments } from './utils'
import ComponentInfo, { Dependence, ImportSpecifer } from './ComponentInfo'

(function (file: string) {
  const code = fs.readFileSync(file, 'utf-8')
  const ast = scriptToAST(code)

  debugger
  // 最上的连续的commentblock类型的注释作为项目的注释
  const mainCommentArr: Array<t.Comment> = ast.comments.reduce((sofar: Array<t.Comment>, comment: t.Comment, index: number, arr: Array<t.Comment>) => {
    if (comment.type === 'CommentBlock' && arr.indexOf(sofar[sofar.length - 1]) + 1 === index) {
      return [...sofar, comment]
    } else {
      return sofar
    }
  }, [])
  const comment = getConcatedComments(mainCommentArr)
  const dependencies: Array<Dependence> = []
  let name = ''
  traverse(ast, {
    // 读取import依赖
    ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
      const source: string = path.node.source.value
      const specifiers: Array<ImportSpecifer> = path.node.specifiers.map(s => {
        return {
          type: s.type,
          name: s.local.name
        }
      })
      // 要将项目注释筛选除去
      const comment: string = getConcatedComments(path.node.leadingComments ? path.node.leadingComments.filter(comment => {
        return !mainCommentArr.includes(comment)
      }) : [])
      const dep: Dependence = {
        source,
        specifiers,
        comment
      }
      dependencies.push(dep)
    },
    // 读取export
    ExportDefaultDeclaration(rootPath: NodePath<t.ExportDefaultDeclaration>) {
      const declaration = rootPath.node.declaration as t.ObjectExpression
      const properties = declaration.properties
      const nameOption = properties.find(node => t.isObjectProperty(node) && node.key.name === 'name') as t.ObjectProperty
      name = (nameOption.value as t.StringLiteral).value
    }
  })
  const ci: ComponentInfo = {
    comment,
    name,
    dependencies
  }
  debugger
  console.log(ci)
})(path.join(__dirname, '..', 'toRead.vue'))
