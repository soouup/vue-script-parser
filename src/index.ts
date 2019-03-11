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
  let name
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

      type VueOptionNameSetAsMethod = 'data'
      type VueOptionNameSetAsProperty = 'name' | 'props' | 'computed' | 'watch' | 'methods'
      type VueOptionName = VueOptionNameSetAsMethod | VueOptionNameSetAsProperty
      function isVueOptionNameSetAsMethod(opName: string): opName is VueOptionNameSetAsMethod {
        return ['data'].includes(opName)
      }
      function isVueOptionNameSetAsProperty(opName: string): opName is VueOptionNameSetAsProperty {
        return ['name', 'props', 'computed', 'watch', 'methods'].includes(opName)
      }

      const nodeOfVueOptions = new Map<VueOptionName, Node>()

      properties.forEach(pNode => {
        if (t.isObjectProperty(pNode) && isVueOptionNameSetAsProperty(pNode.key.name)) {
          nodeOfVueOptions.set(pNode.key.name, pNode)
        } else if (t.isObjectMethod(pNode) && isVueOptionNameSetAsMethod(pNode.key.name)) {
          nodeOfVueOptions.set(pNode.key.name, pNode)
        }
      })

      const nameNode = nodeOfVueOptions.get('name')
      name = nameNode ? ((nameNode as t.ObjectProperty).value as t.StringLiteral).value : null

      const props = nodeOfVueOptions.get('props')
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
