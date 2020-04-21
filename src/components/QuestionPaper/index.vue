<template>
  <div>
    <div style="font-size: 18px">总分{{ getTotalScore }}</div>
    <h2 align="center">{{ title }}</h2>
    <el-card v-for="item in questions" :key="item.id" class="box-card" style="margin-bottom: 10px">
      <div slot="header" class="clearfix">
        <span>
          <el-tag type="success">{{ item.questionType | typeFilter }}</el-tag>
        </span>

        <span style="font-size: 16px">{{ item.content }} </span>
        <el-tag type="danger">{{ item.score }}分</el-tag>

      </div>
      <div v-if="item.questionType === 0" style="margin-bottom: 10px; font-size: 15px">
        <div>A: {{ item.optionA }}</div>
        <div>B: {{ item.optionB }}</div>
        <div>C: {{ item.optionC }}</div>
        <div>D: {{ item.optionD }}</div>
      </div>
      <div>
        <span style="color: #F56C6C; font-size: 18px">答案:</span>
        <span style="color: #606266">{{ item.answer }}</span>
      </div>
    </el-card>
  </div>
</template>

<script>
import { questionTypeOptions, questionTypeKeyValue } from '@/utils/question-type'

export default {
  name: 'QuestionPaper',
  filters: {
    typeFilter(type) {
      return questionTypeKeyValue[type]
    }
  },
  props: {
    questions: {
      type: Array
    },
    title: {
      type: String
    }
  },
  data() {
    return {
      questionTypeOptions
    }
  },
  computed: {
    getTotalScore() {
      return this.questions.reduce((pre, cur) => pre + cur.score, 0)
    }
  }
}
</script>

<style scoped>

</style>
