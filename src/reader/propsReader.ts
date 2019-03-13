import { NodePath, Node } from '@babel/traverse'
import * as t from '@babel/types'
import generate from '@babel/generator'

import { VueOptionName, Prop } from '../ComponentTypes'
import { getConcatedComments } from '../utils'

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
            return {
              name: p.key.name as string,
              type: generate(p.value).code,
              comment: getConcatedComments(p.leadingComments || [])
            }
            // like propA:{}
          } else if (t.isObjectExpression(p.value)) {

            const typeNode = p.value.properties.find((pp) => (pp as t.ObjectProperty).key.name === 'type') as t.ObjectProperty
            const type = typeNode ? generate(typeNode.value).code : ''

            const requiredNode = p.value.properties.find((pp) => (pp as t.ObjectProperty).key.name === 'required') as t.ObjectProperty
            return {
              name: p.key.name as string,
              required: false,
              type,
              default: '',
              validator: false,
              comment: getConcatedComments(p.leadingComments || []),
            }
          } else {
            console.warn('some props value is invalid')
            return null
          }
        } else {
          console.warn('some props do not set as object property')
          return null
        }
      }).filter((v: { name: string } | null): v is { name: string } => !!v)
    }
  }
  return []
}