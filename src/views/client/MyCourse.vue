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
      <el-table-column label="ID" prop="id" sortable="custom" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="课程名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课时" align="center">
        <template slot-scope="{row}">
          <span>{{ row.period }}</span>
        </template>
      </el-table-column>
      <el-table-column label="老师" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createName }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import waves from '@/waves'
  import {getMyCourse} from '@/api/course'
  import store from '@/store'

  export default {
    name: 'MyCourse',
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
        courseTable: null,
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}]
        }
      }
    },
    created() {
      this.courseTable = store.getters.courseTable
      this.getMyCourse()
    },
    methods: {
      getMyCourse() {
        this.listLoading = true
        getMyCourse(this.courseTable).then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getMyCourse()
      },
      resetTemp() {
        const time = new Date().getTime()
        this.signForm = {
          name: '课程签到',
          date: [time, time + 1000 * 60 * 5],
          value: []
        }
      },
      getCourseAndClazz() {
        getCourseAndClazz().then((response) => {
          this.options = response.payload
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
            createSign(this.signForm).then(() => {
              this.dialogFormVisible = false
              this.getSignList()
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
      handleInfo(id) {
        getSignRecord(id).then((response) => {
          this.recordData = response.payload
          this.signRecordShow = true
        })
      },
      handleUpdate(row) {
        this.signForm = {
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
    }
  }
</script>
