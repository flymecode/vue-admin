<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="listQuery.value"
        class="filter-item"
        :options="options"
        clearable
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        创建作业
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
      <el-table-column label="ID" prop="id" sortable="custom" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考试标题" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="试卷名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课程" align="center">
        <template slot-scope="{row}">
          <span>{{ row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="班级" align="center">
        <template slot-scope="{row}">
          <span>{{ row.clazzName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="时间" align="center">
        <template slot-scope="{row}">
          <count-down
            :start-time="row.startTime"
            :end-time="row.endTime"
            :day-txt="'天'"
            :hour-txt="'小时'"
            :minutes-txt="'分钟'"
            :seconds-txt="'秒'"
            :is-start="false"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleInfo(row)">
            详情
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getContestList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="contest"
        label-position="left"
        label-width="80px"
        style=" margin-left:10px;"
      >
        <el-form-item label="作业名称">
          <el-input v-model="contest.title" />
        </el-form-item>
        <el-form-item label="选择试卷">
          <el-select v-model="contest.questionPaperId" filterable placeholder="请选择">
            <el-option
              v-for="item in papers"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择班级">
          <el-cascader
            v-model="contest.value"
            :options="options"
          />
        </el-form-item>
        <el-form-item label="设置时间">
          <el-date-picker
            v-model="contest.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/waves'
import Pagination from '@/components/Pagination'
import CountDown from '@/components/CountDown'
import { addContest, getContestList } from '@/api/contest'
import { getPapers } from '@/api/paper'
import { getCourseAndClazz } from '@/api/course'

export default {
  name: 'Contest',
  components: { Pagination, CountDown },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        value: undefined,
        type: 2
      },
      signRecordShow: false,
      recordData: null,
      papers: [],
      contest: {
        title: '',
        value: [],
        time: [],
        questionPaperId: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      options: null,
      textMap: {
        update: '编辑',
        create: '创建测试'
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getContestList()
    this.getCourseAndClazz()
    this.getPapers()
  },
  methods: {
    getContestList() {
      this.listLoading = true
      const query = {
        page: this.listQuery.page,
        limit: this.listQuery.limit
      }
      if (this.listQuery.value !== undefined) {
        query.clazzId = this.listQuery.value[1]
        query.courseId = this.listQuery.value[0]
      }
      query.type = 2
      getContestList(query).then(response => {
        this.list = response.payload.list
        this.total = response.payload.total
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getCourseAndClazz() {
      getCourseAndClazz().then((response) => {
        this.options = response.payload
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getContestList()
    },
    resetTemp() {
      this.contest = {}
    },
    getPapers() {
      getPapers().then((response) => {
        this.papers = response.payload
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.contest.type = 2
          addContest(this.contest).then(() => {
            this.dialogFormVisible = false
            this.getContestList()
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.contest = {
        name: row.name,
        date: [row.startTime, row.endTime],
        value: [row.courseId, row.clazzId]
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleInfo(row) {
      this.$router.push({ path: '/admin/contest/info', query: { id: row.id, questionPaperId: row.questionPaperId }})
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    }
  }
}
</script>
