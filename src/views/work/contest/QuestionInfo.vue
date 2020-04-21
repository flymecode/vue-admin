<template>
  <div>
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
          <el-radio v-model="item.r" disabled label="A">{{ item.optionA }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" disabled label="B">{{ item.optionB }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" disabled label="C">{{ item.optionC }}</el-radio>
        </div>
        <div>
          <el-radio v-model="item.r" disabled label="D">{{ item.optionD }}</el-radio>
        </div>
      </div>
      <div v-if="item.questionType !== 0">
        <el-input v-model="item.r" :rows="4" :disabled="true" type="textarea" />
        <el-input
          v-model="item.temp"
          placeholder="请输入成绩"
          prefix-icon="el-icon-search"
        />
      </div>
      <div>
        <span style="color: #F56C6C; font-size: 18px">答案:</span>
        <span style="color: #606266">{{ item.answer }}</span>
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
    }
  },
  data() {
    return {
      autosize: {
        type: [Boolean, Object],
        default: false
      }
    }
  }
}
</script>

