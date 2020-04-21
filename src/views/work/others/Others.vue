<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="value"
        class="filter-item"
        :options="options"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="getGradeExts">
        查找
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
      <el-table-column label="学号" prop="id" sortable="custom" width="100px">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="总成绩" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.result }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleInfo(row)">
            详情
          </el-button>
          <el-button type="primary" size="mini" @click="handleCreate(row)">
            添加平时成绩
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="gradeExt"
        label-position="left"
        label-width="80px"
        style=" margin-left:10px;"
      >
        <el-form-item label="名称">
          <el-input v-model="gradeExt.title" />
        </el-form-item>
        <el-form-item label="分数">
          <el-input v-model="gradeExt.grade" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="gradeExt.type" />
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

    <el-dialog title="详情" :visible.sync="gradeExtInfo">
      <el-table :data="gradeExtList">
        <el-table-column property="username" label="学号" />
        <el-table-column property="title" label="标题" />
        <el-table-column property="grade" label="分数" />
        <el-table-column property="type" label="类型">
          <template slot-scope="{row}">
            <el-tag v-if="row.type === 0" type="danger">活动</el-tag>
            <el-tag v-else>习题</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button type="danger" size="mini" @click="handleDelete(row,$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/waves'
import { parseTime } from '@/utils'
import { getCourseAndClazz } from '@/api/course'
import { getGradeExts, createGradeExt, deleteGradeExt, getGradeExtInfo, updateGradeExt } from '@/api/gradeExt'

export default {
  name: 'Others',
  directives: { waves },
  data() {
    return {
      downloadLoading: false,
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      value: null,
      gradeExtInfo: false,
      gradeExtList: null,
      options: [],
      gradeExt: {},
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      row: null,
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.listLoading = false
    this.getCourseAndClazz()
  },
  methods: {
    getGradeExts() {
      this.listLoading = true
      getGradeExts(this.value[0], this.value[1]).then(response => {
        this.list = response.payload
        this.total = this.list.length
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
    handleCreate(row) {
      this.gradeExt = {
        username: row.username,
        name: row.name,
        clazzId: this.value[1],
        courseId: this.value[0]
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createGradeExt(this.gradeExt).then(() => {
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
    handleInfo(row) {
      this.row = row
      getGradeExtInfo(row.username, this.value[0], this.value[1]).then((response) => {
        this.gradeExtList = response.payload
        this.gradeExtInfo = true
      })
    },
    handleUpdate(row) {
      this.old = row.grade
      this.gradeExt = {
        id: row.id,
        name: row.name,
        grade: row.grade,
        type: row.type,
        title: row.title
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
          updateGradeExt(this.gradeExt).then(() => {
            const index = this.gradeExtList.findIndex(v => v.id === this.gradeExt.id)
            this.gradeExtList.splice(index, 1, this.gradeExt)
            this.row.result += this.gradeExt.grade - this.old
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
      deleteGradeExt(row.id).then(() => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.gradeExtList.splice(index, 1)
      })
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
          const tHeader = ['学号', '姓名', '总成绩']
          const filterVal = ['username', 'name', 'result']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: '平时成绩'
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
