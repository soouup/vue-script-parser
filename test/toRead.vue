<template>
  <el-upload
  :disabled="isDisabled"
  :style="{width}"
  :list-type="listType"
  :file-list="imgDefaultList"
  :multiple="false"
  :limit="multifile ? limit : 1"
  :action="BASE_URL + url"
  :data="{userId,token}"
  :before-upload="beforeImgUpload"
  :on-success="handleUploadSuccess"
  :on-remove="handlefileRemove"
  :on-exceed="hanldeExceed"
  with-credentials>
    <el-button size="small" type="primary" :disabled="isDisabled">点击上传</el-button>
  </el-upload>
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
import * as api2 from 'api'
// api8api8api8
import {
  BASE_URL,
  api8
} from '@/config/constants'
import api from '../../api/'
const api3 = require('api3')
export default {
  name: 'SeaFileUploader',
  props: ['title', 'likes', 'isPublished', 'commentIds', 'author'],
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
  activated: function(){
    console.log('activated')
  },
  mounted(){
    console.log('mounted')
  },
  data () {
    return {
      BASE_URL: BASE_URL,
      imgDefaultList: [],
      userId: window.localStorage['shAdmin'] ? JSON.parse(window.localStorage['shAdmin']).userId.toString() : '',
      token: window.localStorage['shAdmin'] ? JSON.parse(window.localStorage['shAdmin']).token : '',
    }
  },
  computed: {
    someCom () {
      return this.BASE_URL.trim()
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
    BASE_URL (val) {
      console.log(val)
    },
    value: {
      handler: function (val) {
        this.imgDefaultList = (val || '').split(',').filter(url => !!url).map(url => ({ name: val, url }))
      },
      immediate: true
    }
  },
  methods: {
    beforeImgUpload (file) {
      console.log(file)
      // 检查文件类型
      if (this.validType) {
        if (!this.isValidTypeAfterCheck(file)) return false
      }
      // 检查文件大小
      if (this.maxSize) {
        if (!this.isValidMaxSizeAfterCheck(file)) return false
      }
      // 检查文件尺寸
      if (this.rulesOfWH) {
        return this.isValidRulesOfWHAfterCheck(file)
      }
    },
    // 返回是否符合格式约束
    isValidTypeAfterCheck (file) {
      const isValidType = this.validType.includes(file.type)
      if (!isValidType) {
        // 取/后的字符
        const validTypeStr = this.validType.map(typeStr => typeStr.replace(/\w+\/(\w+)/, '$1')).join('/')
        this.$message.error(`上传图片只能是 ${validTypeStr} 格式!`)
        return false
      } else {
        return true
      }
    },
    // 是否符合最大文件大小的约束
    isValidMaxSizeAfterCheck (file) {
      const isValidSize = file.size / 1024 / 1024 < this.maxSize
      if (!isValidSize) {
        this.$message.error(`上传图片大小不能超过 ${this.maxSize}MB!`)
        return false
      } else {
        return true
      }
    },
    // 是否符合宽高的约束，返回promise
    isValidRulesOfWHAfterCheck (file) {
      const self = this
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        reader.onload = function (event) {
          const image = new Image()
          image.onload = function () {
            const width = this.width
            const height = this.height
            const showErrorMsg = function () {
              let rule = '图片尺寸'
              if (self.rulesOfWH.minWidth) { rule += `不小于${self.rulesOfWH.minWidth || 'xxx'}*${self.rulesOfWH.minHeight || 'xxx'}` }
              if (self.rulesOfWH.maxWidth) { rule += `，不大于${self.rulesOfWH.maxWidth || 'xxx'}*${self.rulesOfWH.maxHeight || 'xxx'}` }
              self.$message.error(rule)
            }
            if (self.rulesOfWH.minWidth) {
              if (width < self.rulesOfWH.minWidth) {
                showErrorMsg()
                reject(new Error('size error'))
              }
            }
            if (self.rulesOfWH.minHeight) {
              if (height < self.rulesOfWH.minHeight) {
                showErrorMsg()
                reject(new Error('size error'))
              }
            }
            if (self.rulesOfWH.maxWidth) {
              if (width > self.rulesOfWH.maxWidth) {
                showErrorMsg()
                reject(new Error('size error'))
              }
            }
            if (self.rulesOfWH.maxHeight) {
              if (height > self.rulesOfWH.maxHeight) {
                showErrorMsg()
                reject(new Error('size error'))
              }
            }
            resolve()
          }
          image.src = event.target.result
        }
        reader.readAsDataURL(file)
      })
    },
    handleUploadSuccess (res) {
      console.log(res)
      if (res.code) {
        this.$notify({
          title: '提示',
          message: res.msg,
          type: 'info'
        })
        return
      }
      const nextValue = (this.value || '')
        .split(',')
        // 去除空项
        .filter(url => !!url)
        .concat([res.data.file])
        .join()
      this.$emit('input', nextValue)
      this.$notify({
        title: '提示',
        message: '上传成功',
        type: 'success'
      })
    },
    handlefileRemove (file) {
      const nextValue = (this.value || '')
        .split(',')
        .filter(url => !!url)
        .filter(url => url !== file.url)
        .join()
      this.$emit('input', nextValue)
    },
    hanldeExceed () {
      this.$message.error('已到达上传个数上限')
    },
  }

}
</script>
