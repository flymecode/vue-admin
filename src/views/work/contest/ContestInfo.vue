<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <el-input-->
      <!--        v-model="listQuery.title"-->
      <!--        placeholder="Title"-->
      <!--        style="width: 200px;"-->
      <!--        class="filter-item"-->
      <!--      />-->
      <!--      <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">-->
      <!--        <el-option v-for="item in clazzNameOptions" :key="item" :label="item" :value="item" />-->
      <!--      </el-select>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="metricsPv">
        成绩分析
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="学号" prop="id" sortable="custom" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.studentId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="客观成绩" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.autoResult }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成绩" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.manulResult + row.autoResult }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag v-if="row.state===0" type="danger">未阅卷</el-tag>
          <el-tag v-else>已阅卷</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button :disabled="row.state===1" type="primary" size="mini" @click="handleInfo(row.id)">
            阅卷
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getContestRecords"
    />
    <el-dialog title="成绩分析" :visible.sync="show" width="40%">
      <p>平均分: {{averageScore}}</p>
      <ve-pie :data="chartData"></ve-pie>
      <div slot="footer" class="dialog-footer">
        <el-button @click="show = false">
          取消
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="阅卷" :visible.sync="dialogFormVisible" width="40%" :fullscreen="true">
      <question-info :questions="questionResults"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="createData()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import waves from '@/waves'
  import Pagination from '@/components/Pagination'
  import {getContestRecords, getMetrics} from '@/api/contest'
  import {getGradeInfo, commitGrade} from '@/api/grade'
  import QuestionInfo from './QuestionInfo'

  export default {
    name: 'ContestInfo',
    components: {QuestionInfo, Pagination},
    directives: {waves},
    filters: {
      typeFilter(type) {
        return calendarTypeKeyValue[type]
      }
    },
    data() {
      return {
        chartData: {
          columns: ['成绩', '比例'],
          rows: []
        },
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          title: undefined,
          type: undefined
        },
        signRecordShow: false,
        recordData: null,
        clazzNameOptions: ['软件1604', '软件1603', '软件1607'],
        papers: [],
        contest: {
          title: '',
          value: [],
          time: [],
          type: undefined,
          questionPaperId: undefined
        },
        dialogFormVisible: false,
        options: null,
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}]
        },
        contestId: undefined,
        questionPaperId: undefined,
        questionResults: null,
        currentId: undefined,
        show: false,
        averageScore: null
      }
    },
    created() {
      this.questionPaperId = this.$route.query.questionPaperId
      this.contestId = this.$route.query.id
      this.getContestRecords(this.contestId)
    },
    methods: {
      handleInfo(id) {
        getGradeInfo(id).then((response) => {
          this.currentId = id
          this.dialogFormVisible = true
          this.questionResults = response.payload.questionResults
        })
      },
      getContestRecords(id) {
        this.listLoading = true
        getContestRecords(id).then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      metricsPv() {
        this.show = true
        getMetrics(this.contestId).then((response) => {
          const data = response.payload.metrics;
          this.averageScore = response.payload.averageScore
          const temp = [];
          if (data != null && data !== '') {
            for (let item in data) {
              temp.push({"成绩": item, "比例": data[item]})
            }
            this.chartData.rows = temp
          }
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getSignList()
      },
      resetTemp() {
        this.contest = {}
      },
      createData() {
        const temp = this.questionResults.filter(r => r.questionType === 2).map(r => {
          return {
            id: r.id,
            score: r.temp
          }
        })
        const data = {
          id: this.currentId,
          scores: temp
        }
        data.questionPaperId = this.questionPaperId
        commitGrade(data).then((response) => {
          this.dialogFormVisible = false
          this.getContestRecords(this.contestId)
          this.$notify({
            title: 'Success',
            message: 'Commit Successfully',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
</script>
