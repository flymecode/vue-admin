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

      <el-table-column label="签到名称" align="center">
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
      <el-table-column label="状态" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.status===0?"未签到":"已签到" }}</el-tag>
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
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="sign(row)">
            签到
          </el-button>
          <el-button v-if="row.curTime >row.endTime && row.status ==0?true:false" type="danger" size="mini"
                     @click="handleCreate(row)">
            申诉
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getSignRecords"
    />

    <el-dialog title="申诉" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="replyForm"
        label-position="left"
        label-width="80px"
        style=" margin-left:10px;"
      >
        <el-form-item label="原因">
          <el-input v-model="replyForm.reason"/>
        </el-form-item>
        <el-form-item v-show="replyForm.type==2" label="设置时间">
          <el-date-picker
            v-model="replyForm.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="replyForm.type" placeholder="请选择">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
  import {getCourseAndClazz} from '@/api/course'
  import CountDown from '@/components/CountDown'
  import {getSignRecords, sign} from '@/api/sign'
  import {createReply} from '@/api/reply'


  export default {
    name: 'Sign',
    components: {Pagination, CountDown},
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
        options: [],
        replyForm: {},
        dialogFormVisible: false,
        dialogStatus: '',
        typeOptions: [{
          value: 1,
          label: '忘记签到'
        }, {
          value: 2,
          label: '请假'
        }],
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}]
        },
        row: null
      }
    },
    created() {
      this.getCourseAndClazz()
      this.getSignRecords()
    },
    methods: {
      sign(row) {
        const data = {
          id: row.id
        }
        sign(data).then((data) => {
          const message = data.header.msg
          const code = data.header.code
          if (code === 200) {
            row.status = 1
            this.$notify({
              title: 'Success',
              message: message,
              type: 'success',
              duration: 2000
            })
          }
        })
      },
      getSignRecords() {
        this.listLoading = true
        getSignRecords().then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getSignList()
      },
      resetTemp() {
        const time = new Date().getTime()
        this.replyForm = {
          reason: '',
          date: [time, time + 1000 * 60 * 5],
          type: 1
        }
      },
      getCourseAndClazz() {
        getCourseAndClazz().then((response) => {
          this.options = response.payload
        })
      },
      handleCreate(row) {
        this.row = row
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
            const tempData = Object.assign({}, this.replyForm)
            tempData.courseId = this.row.courseId
            tempData.clazzId = this.row.clazzId
            tempData.signId = this.row.id
            createReply(tempData).then(() => {
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
