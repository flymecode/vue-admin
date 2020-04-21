<template>
  <div class="app-container">
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="100px">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="测试名称" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="测试类型" align="center">
        <template slot-scope="{ row }">
          <el-tag>{{ row.type | contestTypeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="试卷名称" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" width="260px">
        <template slot-scope="{ row }">
          <count-down
            :start-time="row.startTime"
            :end-time="row.endTime"
            :current-time="row.curTime"
            :day-txt="'天'"
            :hour-txt="'小时'"
            :minutes-txt="'分钟'"
            :seconds-txt="'秒'"
            :is-start="false"
            @endCallback="endCallBack(row)"
            @startCallback="startCallBack(row)"
          />
          <el-button v-if="row.state === 1" type="primary" size="mini" @click="getQuestions(row)">
            开始考试
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="showContest" :fullscreen="true" width="30%">
      <count-down
        :start-time="startTime"
        :end-time="endTime"
        :day-txt="'天'"
        :hour-txt="'小时'"
        :minutes-txt="'分钟'"
        :seconds-txt="'秒'"
        :is-start="false"
      />
      <start-contest :title="paperTitle" :start-time="startTime" :end-time="endTime" :questions="questions" />
      <el-button @click="showContest = false">取 消</el-button>
      <el-button type="primary" @click="commitContest">提 交 试 卷</el-button>
    </el-dialog>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="fetchContestList"
    />

  </div>
</template>

<script>
import waves from '@/waves'
import CountDown from '@/components/CountDown'
import Pagination from '@/components/Pagination'
import store from '@/store'
import { parseTime } from '@/utils'
import { questionTypeOptions, questionTypeKeyValue } from '@/utils/question-type'
import { fetchContestList, updateContestSate, commitContest, getContestRecord } from '@/api/contest'
import StartContest from '@/views/client/StartContest'
import { fetchQuestionsById } from '@/api/question'

export default {
  name: 'QuestionManager',
  components: {
    StartContest,
    Pagination,
    CountDown
  },
  directives: { waves },
  filters: {
    parseTime,
    typeFilter(type) {
      return questionTypeKeyValue[type]
    },
    contestTypeFilter(type){
      const map = {
        1:'测试',
        2:'作业'
      }
      return map[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined
      },
      courseTable: Array,
      showContest: false,
      questionTypeOptions,
      endTime: 0,
      startTime: 0,
      paperTitle: '',
      questions: [],
      contest: {
        title: '',
        time: undefined,
        type: ''
      },
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      temp: {
        id: undefined,
        difficulty: undefined,
        title: '',
        questionType: ''
      },
      downloadLoading: false,
      row: {}
    }
  },
  created() {
    this.courseTable = store.getters.courseTable
    this.fetchContestList()
  },
  methods: {
    startCallBack(row) {
      if (row.state === 0) {
        updateContestSate(row.id, 1).then(() => {
          row.state = 1
        })
      }
    },
    endCallBack(row) {
      if (!(row.state === 2)) {
        updateContestSate(row.id, 2).then(() => {
          row.state = 2
        })
      }
    },
    commitContest() {
      const data = this.questions.map(item => {
        return {
          id: item.id,
          r: item.r
        }
      })
      const request = {
        contestId: this.row.id,
        quesitons: this.row.questions,
        questionPaperId: this.row.questionPaperId,
        answer: data
      }
      commitContest(request).then(() => {
        this.showContest = false
        this.$notify({
          title: 'Success',
          message: 'Commit Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    fetchContestList() {
      this.listLoading = true
      fetchContestList(JSON.stringify(this.courseTable)).then(response => {
        this.list = response.payload
        this.total = this.list.length
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchPaperList()
    },
    getQuestions(row) {
      getContestRecord(row.id).then((response) => {
        if (response.payload) {
          this.$notify({
            title: '提醒',
            message: '你已提交，请勿重复作答',
            type: 'success',
            duration: 2000
          })
        } else {
          this.endTime = row.endTime
          this.startTime = row.startTime
          this.paperTitle = row.name
          this.row = row
          fetchQuestionsById(row.questions).then(response => {
            this.questions = response.payload
            this.showContest = true
          })
        }
      })
    }
  }
}
</script>
