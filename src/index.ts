import traverse, { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'

import scriptToAST from './scriptToAST'
import getConcatedComments from './helpers/getConcatedComments'
import { isFunctionProperty } from './helpers/processFunctionProperty'
import ComponentInfo, {
  VueOptionNameSetAsMethod,
  VueOptionNameSetAsProperty,
  VueOptionName,
  ImportSpecifer,
  lifeCycleName,

  Dependence,
  Prop,
  Data,
  Method,
  Computed,
  Watch,
  LifeCycle
} from './ComponentTypes'

import nameReader from './readers/nameReader'
import propsReader from './readers/propsReader'
import dataReader from './readers/dataReader'
import methodsReader from './readers/methodsReader'
import computedReader from './readers/computedReader'
import watchReader from './readers/watchReader'
import lifeCyclesReader from './readers/lifeCyclesReader'

export default function (code: string): ComponentInfo {
  const ast = scriptToAST(code)
  // 最上的连续的commentblock类型的注释作为项目的注释
  const mainCommentArr: t.Comment[] = ast.comments.reduce((sofar: t.Comment[], comment: t.Comment, index: number, arr: t.Comment[]) => {
    if (comment.type === 'CommentBlock' && arr.indexOf(sofar[sofar.length - 1]) + 1 === index) {
      return [...sofar, comment]
    } else {
      return sofar
    }
  }, [])
  const comment = getConcatedComments(mainCommentArr)
  const dependencies: Dependence[] = []
  let name
  let props: Prop[] = []
  let data: Data[] = []
  let methods: Method[] = []
  let computed: Computed[] = []
  let watch: Watch[] = []
  let lifeCycles: LifeCycle[] = []
  traverse(ast, {
    // 读取import依赖
    ImportDeclaration (path: NodePath<t.ImportDeclaration>) {
      const source: string = path.node.source.value
      const specifiers: ImportSpecifer[] = path.node.specifiers.map(s => {
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
    ExportDefaultDeclaration (rootPath: NodePath<t.ExportDefaultDeclaration>) {
      const declaration = rootPath.node.declaration as t.ObjectExpression
      const properties = declaration.properties

      function isVueOptionNameSetAsMethod (opName: string): opName is VueOptionNameSetAsMethod {
        return ['data', ...lifeCycleName].includes(opName)
      }
      function isVueOptionNameSetAsProperty (opName: string): opName is VueOptionNameSetAsProperty {
        return ['name', 'props', 'computed', 'watch', 'methods'].includes(opName)
      }

      const nodeOfVueOptions = new Map<VueOptionName, Node>()

      properties.forEach(pNode => {
        if ((t.isObjectProperty(pNode) || t.isObjectMethod(pNode)) && isFunctionProperty(pNode) && isVueOptionNameSetAsMethod(pNode.key.name)) {
          nodeOfVueOptions.set(pNode.key.name, pNode)
        } else if (t.isObjectProperty(pNode) && isVueOptionNameSetAsProperty(pNode.key.name)) {
          nodeOfVueOptions.set(pNode.key.name, pNode)
        }
      })

      name = nameReader(nodeOfVueOptions)
      props = propsReader(nodeOfVueOptions)
      data = dataReader(nodeOfVueOptions)
      methods = methodsReader(nodeOfVueOptions)
      computed = computedReader(nodeOfVueOptions)
      watch = watchReader(nodeOfVueOptions)
      lifeCycles = lifeCyclesReader(nodeOfVueOptions)
    }
  })
  const ci: ComponentInfo = {
    comment,
    name,
    dependencies,
    props,
    data,
    computed,
    methods,
    watch,
    lifeCycles
  }

  return ci
}
