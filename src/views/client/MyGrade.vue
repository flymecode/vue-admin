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
      <el-table-column label="课程" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考试成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.contestGrade }}</span>
        </template>
      </el-table-column>
      <el-table-column label="签到成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.signGrade }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作业成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.homeworkGrade }}</span>
        </template>
      </el-table-column>
      <el-table-column label="互动成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.othersGrade }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总成绩" align="center">
        <template slot-scope="{row}">
          <span>{{ row.result }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import waves from '@/waves'
  import {getMyGrade} from '@/api/grade'

  export default {
    name: 'Sign',
    directives: {waves},
    data() {
      return {
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
        options: [],
        signForm: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建签到'
        },
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}]
        }
      }
    },
    created() {
      this.getMyGrade()
    },
    methods: {
      getMyGrade() {
        this.listLoading = true
        getMyGrade().then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      }
    }
  }
</script>
