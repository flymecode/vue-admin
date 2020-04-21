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
        创建通知
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
      <el-table-column label="名称" align="center">
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

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleInfo(row.content)">
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
      @pagination="getNoticeList"
    />
    <el-dialog title="详情" :visible.sync="contentVisible" width="40%">
      <p>{{content}}</p>
    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="notice"
        label-position="left"
        label-width="80px"
        style=" margin-left:10px;"
      >
        <el-form-item label="通知标题">
          <el-input v-model="notice.name"/>
        </el-form-item>

        <el-form-item label="选择班级">
          <el-cascader
            v-model="notice.value"
            :options="options"
          />
        </el-form-item>
        <el-form-item label="通知内容">
          <el-input v-model="notice.content" type="textarea" :autosize="{ minRows: 8, maxRows: 14}"/>
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
  import {getNoticeList, createNotice, deleteNotice} from '@/api/notice'

  export default {
    name: 'Notice',
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
        recordData: null,
        options: [],
        notice: {},
        dialogFormVisible: false,
        contentVisible:false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        content: '',
        rules: {
          name: [{required: true, message: '请输入名称', trigger: 'blur'}]
        }
      }
    },
    created() {
      this.getCourseAndClazz()
      this.getNoticeList()
    },
    methods: {
      getNoticeList() {
        this.listLoading = true
        const query = {
          page: this.listQuery.page,
          limit: this.listQuery.limit
        }
        if (this.listQuery.value !== undefined) {
          query.clazzId = this.listQuery.value[1]
          query.courseId = this.listQuery.value[0]
        }
        getNoticeList(query).then(response => {
          this.list = response.payload.list
          this.total = response.payload.total
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getNoticeList()
      },
      resetTemp() {
        this.notice = {
          name: '',
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
            createNotice(this.notice).then(() => {
              this.dialogFormVisible = false
              this.getNoticeList()
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
      handleInfo(content) {
        this.contentVisible = true
        this.content = content
      },
      handleUpdate(row) {
        this.notice = {
          name: row.name,
          value: [row.courseId, row.clazzId],
          content: row.content
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
        deleteNotice(row.id).then(() => {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.total = this.total - 1
          this.list.splice(index, 1)
        })
      }
    }
  }
</script>
