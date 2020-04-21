<template>
  <div>
    <div style="font-size: 18px">总分{{ getTotalScore }}</div>
    <h2 align="center">{{ title }}</h2>
    <el-card v-for="(item,key) in questions" :key="item.id" class="box-card" style="margin-bottom: 10px">
      <div slot="header" class="clearfix">
        <span>
          <el-tag type="success">{{ item.questionType | typeFilter }}</el-tag>
        </span>

        <span style="font-size: 16px">{{ key + 1 }}:{{ item.content }} </span>
        <el-tag type="danger">{{ item.score }}分</el-tag>

      </div>
      <div v-if="item.questionType === 0" style="margin-bottom: 10px; font-size: 15px">
        <div>
          <el-radio v-model="item.r" label="A">{{ item.optionA }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" label="B">{{ item.optionB }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" label="C">{{ item.optionC }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" label="D">{{ item.optionD }}</el-radio>
        </div>
      </div>
      <div v-if="item.questionType !== 0">
        <el-input v-model="item.r" :rows="4" placeholder="请输入内容" type="textarea" />
      </div>
    </el-card>
  </div>
</template>

<script>
import { questionTypeKeyValue } from '@/utils/question-type'

export default {
  name: 'StartContest',
  filters: {
    typeFilter(type) {
      return questionTypeKeyValue[type]
    }
  },
  props: {
    questions: {
      type: Array
    },
    endTime: {
      type: Number
    },
    title: {
      type: String
    },
    startTime: {
      type: Number
    }
  },
  data() {
    return {
      autosize: {
        type: [Boolean, Object],
        default: false
      }
    }
  },
  computed: {
    getTotalScore() {
      return this.questions.reduce((pre, cur) => pre + cur.score, 0)
    }
  },
  created() {

  },
  methods: {}
}
</script>

