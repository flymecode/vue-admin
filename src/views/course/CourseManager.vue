<template>
  <div class="app-container">
    <div class="filter-container">
<!--      <el-input-->
<!--        v-model="listQuery.name"-->
<!--        placeholder="Title"-->
<!--        style="width: 200px;"-->
<!--        class="filter-item"-->
<!--        @keyup.enter.native="handleFilter"-->
<!--      />-->
<!--      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">-->
<!--        查找-->
<!--      </el-button>-->
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
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
    >
      <el-table-column label="课程ID" prop="id" sortable="custom" width="80px">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="课时" align="center">
        <template slot-scope="{row}">
          <span>{{ row.period }}</span>
        </template>
      </el-table-column>

      <el-table-column label="创建人" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleInfo(row.id)">
            详情
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
<!--          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">-->
<!--            删除-->
<!--          </el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getCourseList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="course"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:100px;"
      >
        <el-form-item label="课程名称" prop="name">
          <el-input v-model="course.name" placeholder="请输入课程名称"/>
        </el-form-item>
        <el-form-item label="课程描述">
          <el-input
            v-model="course.description"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
        <el-form-item label="课时">
          <el-input-number v-model="course.period" controls-position="right" :min="1" :max="100"/>
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
  import {parseTime} from '@/utils'
  import Pagination from '@/components/Pagination'
  import {createCourse, fetchCourseList} from '@/api/course'

  export default {
    name: 'CourseManager',
    components: {Pagination},
    directives: {waves},
    filters: {
      typeFilter(type) {
        return calendarTypeKeyValue[type]
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
        course: {
          period: 1,
          description: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        rules: {
          name: [{required: true, message: '请填写课程名称', trigger: 'blur'}]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getCourseList()
    },
    methods: {
      getCourseList() {
        this.listLoading = true
        fetchCourseList().then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleInfo(id) {
        this.$router.push({path: '/admin/course/info', query: {id: id}})
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getCourseList()
      },
      resetTemp() {
        this.course = {
          period: 1,
          description: ''
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
            createCourse(this.course).then(() => {
              this.getCourseList()
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
        this.course = Object.assign({}, row)
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
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['id', 'name', 'description', 'period']
          const filterVal = ['id', 'name', 'description', 'period']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '课程列表'
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
      }
    }
  }
</script>
