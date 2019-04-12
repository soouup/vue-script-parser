<template>
<div></div>
</template>

<script>
/* TITLE:aaaaaaa */
/* TITLE:bbbbbbb */

// apiapiapi
// apiapiapi

// apiapiapi
/* aaaa
ssssss
bbbbbb */
import * as api1 from '@/someDir'
// api8api8api8
import api2, { api3 } from '@/someDir'
import api4 from '@/someDir'
const api5 = require('api3')
export default {
  name: 'someName',
  props: ['propA', 'propB'],
  props: {
    // 基础的类型检查 (`null` 和 `undefined` 会通过任何类型验证)
    propA: Number,
    // 多个可能的类型
    propB: [String, Number],
    // 必填的字符串
    propC: {
      type: String,
      required: true
    },
    // 带有默认值的数字
    propD: {
      type: [Number, String],
      required: true,
      default: 100,
      default: null,
      default: undefined,
      default: Symbal(),
      default () { return 1 },
      default: () => { },
      default: function () { return {} },
      validator (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    },
    // 带有默认值的对象
    propE: {
      type: Object,
      // 对象或数组默认值必须从一个工厂函数获取
      default: '1'
    },
    // 自定义验证函数
    propF: {
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['success', 'warning', 'danger'].indexOf(value) !== -1
      }
    }
  },
  activated: function () {
    console.log('activated')
  },
  mounted () {
    console.log('mounted')
  },
  data () {
    return {
      someData1: 0,
      someData2: api1,
    }
  },
  computed: {
    someCom () {
      return this.someData2.trim()
    },
    someCom2: {
      get () {
        return '1'
      },
      set () {
        return '2'
      }
    }
  },
  watch: {
    someData1 (val) {
      console.log(val)
    },
    someData2: {
      handler: function (val) {
        console.log(this.someCom)
      },
      immediate: true
    }
  },
  methods: {
    someMe1: function () {
      return this.someCom
    },
    someMe2: function () {
      return this.someCom
    },
  }

}
</script>
