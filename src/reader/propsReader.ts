import { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'
import generate from '@babel/generator'

import { VueOptionName, Prop } from '../ComponentTypes'
import getConcatedComments from '../helpers/getConcatedComments'
import processFunctionProperty from '../helpers/processFunctionProperty'

export default function (nodeOfVueOptions: Map<VueOptionName, Node>) {
  const node = nodeOfVueOptions.get('props') as t.ObjectProperty | undefined
  if (node) {
    // like: props: [xxx,xxx,xxx]
    if (t.isArrayExpression(node.value)) {
      const elements = node.value.elements
      return elements.map(p => {
        return {
          name: (p as t.StringLiteral).value
        }
      })
    }
    // like: props: {xxx:xxx,xxx:xxx}
    if (t.isObjectExpression(node.value)) {
      const properties = node.value.properties
      return properties.map(p => {
        // if not method or spread
        if (t.isObjectProperty(p)) {
          // like propA: Number || propA: [Number,String]
          if (t.isIdentifier(p.value) || t.isArrayExpression(p.value)) {
            const prop: Prop = {
              name: p.key.name as string,
              type: generate(p.value).code,
              comment: getConcatedComments(p.leadingComments || [])
            }
            return prop
            // like propA:{}
          } else if (t.isObjectExpression(p.value)) {
            let prop: Prop = {
              name: p.key.name as string,
              comment: getConcatedComments(p.leadingComments || [])
            }
            p.value.properties.forEach(pp => {
              if (t.isObjectProperty(pp) && pp.key.name === 'type') {
                prop.type = generate(pp.value).code
              }
              if (t.isObjectProperty(pp) && pp.key.name === 'required') {
                prop.required = (pp.value as t.BooleanLiteral).value
              }
              // like propA:{default: 1} or {default:()=>{}} or {default:function(){return {}}}
              if (t.isObjectProperty(pp) && pp.key.name === 'default') {
                // not fn
                if (t.isNumericLiteral(pp.value) || t.isStringLiteral(pp.value) || t.isBooleanLiteral(pp.value)) {
                  prop.default = pp.value.value
                } else if (t.isNullLiteral(pp.value)) {
                  prop.default = null
                } else if (t.isIdentifier(pp.value) && pp.value.name === 'undefined') {
                  prop.default = undefined
                } else if (t.isFunctionExpression(pp.value) || t.isArrowFunctionExpression(pp.value)) {
                  prop.default = processFunctionProperty(pp)
                } else {
                  console.warn('default not set as any of number,string,boolean,null,undefined,generator function')
                }
              }
              // like propA:{default(){return {}}}
              if (t.isObjectMethod(pp) && pp.key.name === 'default') {
                prop.default = processFunctionProperty(pp)
              }
              if ((t.isObjectProperty(pp) || t.isObjectMethod(pp)) && pp.key.name === 'validator') {
                prop.validator = processFunctionProperty(pp)
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