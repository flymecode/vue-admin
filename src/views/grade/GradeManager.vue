<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="listQuery.value"
        class="filter-item"
        :options="options"
      />
      <el-select v-model="listQuery.ruleId" style="width: 140px" class="filter-item">
        <el-option v-for="item in rulesOptions" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
                 @click="handleCreate">
        添加规则
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download"
                 @click="handleDownload">
        导出
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
      @sort-change="sortChange"
    >
      <el-table-column label="学号" prop="id" sortable="custom" align="center" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="考试分数" align="center">
        <template slot-scope="{row}">
          <span v-if="true" class="link-type" @click="handleCdPv(row.contests)">{{ row.contestGrade }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="签到分数" align="center">
        <template slot-scope="{row}">
          <span v-if="true" class="link-type" @click="handleSignPv(row.signRecords)">{{ row.signGrade }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="作业分数" align="center">
        <template slot-scope="{row}">
          <span v-if="true" class="link-type" @click="handleCdPv(row.homeworkGrades)">{{ row.homeWorkGrade }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
      <el-table-column label="互动分数" align="center">
        <template slot-scope="{row}">
          <span v-if="true" class="link-type" @click="handleOthersPv(row.gradeExts)">{{ row.others }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总分数" align="center">
        <template slot-scope="{row}">
          <span v-if="true" style="color: #20a0ff">{{ row.result }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:50px;">
        <el-form-item label="模版名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="测试比重" prop="contestWeight">
          <el-input v-model="temp.contestWeight"/>
        </el-form-item>
        <el-form-item label="签到比重" prop="signWeight">
          <el-input v-model="temp.signWeight"/>
        </el-form-item>
        <el-form-item label="作业比重" prop="homeworkWeigth">
          <el-input v-model="temp.homeworkWeight"/>
        </el-form-item>
        <el-form-item label="平时比重" prop="othersWeight">
          <el-input v-model="temp.othersWeight"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!--签到记录-->
    <el-dialog title="签到记录" :visible.sync="signShow">
      <el-table :data="signRecords" style="width: 100%">
        <el-table-column prop="signId" label="ID" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column label="日期" >
          <template slot-scope="{row}">
            <span v-if="row.status===1">{{row.signTime}}</span>
            <span v-else>- - -</span>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="{row}">
            <el-tag v-if="row.status===1">签到</el-tag>
            <el-tag type="danger" v-else>未签到</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>


    <!--作业记录/考试记录-->
    <el-dialog title="记录" :visible.sync="chShow">
      <el-table :data="contestOrHomework">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="manulResult" label="客观题成绩" />
        <el-table-column prop="autoResult" label="主观题成绩" />
        <el-table-column prop="result" label="总成绩" />
      </el-table>
    </el-dialog>

    <!--互动-->
    <el-dialog title="记录" :visible.sync="otherShow">
      <el-table :data="othersData">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="grade" label="分数" />
      </el-table>
    </el-dialog>


  </div>
</template>

<script>
  import waves from '@/waves'
  import {parseTime} from '@/utils'
  import {getCourseAndClazz} from '@/api/course'
  import {getSumGrade} from '@/api/grade'
  import {createRule, getRules} from '@/api/rule'

  export default {
    name: 'GradeManager',
    directives: {waves},
    data() {
      return {
        options: null,
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          value: undefined
        },
        temp: {
          id: undefined,
        },
        dialogFormVisible: false,
        dialogStatus: '',
        rulesOptions: [],
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        rules: {
          type: [{required: true, message: 'type is required', trigger: 'change'}],
          timestamp: [{type: 'date', required: true, message: 'timestamp is required', trigger: 'change'}],
          title: [{required: true, message: 'title is required', trigger: 'blur'}]
        },
        downloadLoading: false,
        signShow: false,
        signRecords: null,
        contestOrHomework:null,
        chShow:false,
        othersData:null,
        otherShow:false
      }
    },
    created() {
      this.listLoading = false
      this.getCourseAndClazz()
      this.getRules()
    },
    methods: {
      getCourseAndClazz() {
        getCourseAndClazz().then((response) => {
          this.options = response.payload
        })
      },
      getSumGrade() {
        this.listLoading = true
        getSumGrade(this.listQuery).then(response => {
          this.list = response.payload
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      getRules() {
        getRules().then((data) => {
          this.rulesOptions = data.payload
        })
      },
      handleSignPv(data) {
        this.signRecords = data
        this.signShow = true
      },
      handleCdPv(data) {
        this.contestOrHomework = data
        this.chShow = true
      },
      handleOthersPv(data) {
        this.othersData = data
        this.otherShow = true
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getSumGrade()
      },
      sortChange(data) {
        const {prop, order} = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      },
      resetTemp() {
        this.temp = {
          id: undefined,
        }
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
            createRule(this.temp).then(() => {
              this.rulesOptions.unshift(this.temp)
              this.dialogFormVisible = false
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
        this.temp = Object.assign({}, row) // copy obj
        this.temp.timestamp = new Date(this.temp.timestamp)
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
      handleDelete(row, index) {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      },
      handleDownload() {
        if (this.list == null) {
          this.$notify({
            title: 'Error',
            message: '没有查询到数据',
            type: 'error',
            duration: 2000
          })
          return
        }
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['学号', '姓名', '考试成绩', '签到成绩', '作业成绩', '互动成绩', '总成绩']
          const filterVal = ['id', 'name', 'contestGrade', 'signGrade', 'homeworkGrade', 'others', 'result']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'grade-list'
          })
          this.downloadLoading = false
        })
      },
      formatJson(filterVal) {
        return this.list.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      getSortClass: function (key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  }
</script>
