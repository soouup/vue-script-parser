import { Node } from '@babel/traverse'
import * as t from '@babel/types'
import generate from '@babel/generator'

import { VueOptionName, Prop } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>): Prop[] {
  const node = nodeOfVueOptions.get('props') as t.ObjectProperty | undefined
  if (node) {
    // like: props: [xxx,xxx,xxx]
    if (t.isArrayExpression(node.value)) {
      const elements = node.value.elements
      return elements.map(propNode => {
        return {
          name: (propNode as t.StringLiteral).value
        }
      })
    }
    // like: props: {xxx:xxx,xxx:xxx}
    if (t.isObjectExpression(node.value)) {
      const properties = node.value.properties
      return properties.map(propNode => {
        // if not method or spread
        if (t.isObjectProperty(propNode)) {
          // like propA: Number || propA: [Number,String]
          if (t.isIdentifier(propNode.value) || t.isArrayExpression(propNode.value)) {
            const prop: Prop = {
              name: propNode.key.name as string,
              type: generate(propNode.value).code,
              comment: getConcatedComments(propNode.leadingComments || [])
            }
            return prop
            // like propA:{}
          } else if (t.isObjectExpression(propNode.value)) {
            let prop: Prop = {
              name: propNode.key.name as string,
              comment: getConcatedComments(propNode.leadingComments || [])
            }
            propNode.value.properties.forEach(propOptionNode => {
              if (t.isSpreadElement(propOptionNode)) {
                return
              }
              const propOptionName = propOptionNode.key.name
              if (t.isObjectProperty(propOptionNode) && propOptionName === 'type') {
                prop.type = generate(propOptionNode.value).code
              }
              if (t.isObjectProperty(propOptionNode) && propOptionName === 'required') {
                prop.required = (propOptionNode.value as t.BooleanLiteral).value
              }
              // like propA:{default: 1} or {default:()=>{}} or {default:function(){return {}}}
              if (t.isObjectProperty(propOptionNode) && propOptionName === 'default') {
                // not fn
                if (t.isNumericLiteral(propOptionNode.value) || t.isStringLiteral(propOptionNode.value) || t.isBooleanLiteral(propOptionNode.value)) {
                  prop.default = propOptionNode.value.value
                } else if (t.isNullLiteral(propOptionNode.value)) {
                  prop.default = null
                } else if (t.isIdentifier(propOptionNode.value) && propOptionNode.value.name === 'undefined') {
                  prop.default = undefined
                } else if (t.isFunctionExpression(propOptionNode.value) || t.isArrowFunctionExpression(propOptionNode.value)) {
                  prop.default = processFunctionProperty(propOptionNode)
                } else {
                  console.warn('default not set as any of number,string,boolean,null,undefined,generator function')
                }
              }
              // like propA:{default(){return {}}}
              if (t.isObjectMethod(propOptionNode) && propOptionName === 'default') {
                prop.default = processFunctionProperty(propOptionNode)
              }
              if ((t.isObjectProperty(propOptionNode) || t.isObjectMethod(propOptionNode)) && propOptionName === 'validator') {
                prop.validator = processFunctionProperty(propOptionNode)
              }
            })
            return prop
          } else {
            console.warn('some props value is invalid')
            return null
          }
        } else {
          console.warn('some props do not set as object property')
          return null
        }
      }).filter((v: Prop | null): v is Prop => !!v)
    }
  }
  return []
}
