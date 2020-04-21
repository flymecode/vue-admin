<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select
        v-model="listQuery.clazzId"
        placeholder="班级"
        clearable
        style="width: 120px"
        class="filter-item"
      >
        <el-option v-for="item in clazzNameOptions" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handlerCreate"
      >
        创建班级
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
      <el-table-column label="学号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="姓名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="创建班级" :visible.sync="dialogFormVisible" :closed="resetUpload">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:100px;"
      >
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入班级名称"/>
        </el-form-item>
      </el-form>
      <upload-excel-component v-show="eshow" :on-success="handleSuccess" :before-upload="beforeUpload"/>
      <el-table :data="temp.tableData" border highlight-current-row style="width: 100%;margin-top:20px;">
        <el-table-column v-for="item of tableHeader" :key="item" :prop="item" :label="item"/>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetUpload">
          重新导入
        </el-button>
        <el-button :disabled="commitStatus" type="primary" @click="createData">
          提 交
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import waves from '@/waves'
  import UploadExcelComponent from '@/components/UploadExcel'
  import {getClazzList, createClazz, getClazzStudents} from '@/api/clazz'

  export default {
    name: 'CourseInfo',
    components: {
      UploadExcelComponent
    },
    directives: {
      waves
    },
    data() {
      return {
        id: 0,
        tableKey: 0,
        course: null,
        total: 0,
        list: null,
        dialogFormVisible: false,
        listLoading: false,
        eshow: true,
        temp: {
          name: '',
          tableData: []
        },
        clazzNameOptions: [],
        listQuery: {
          clazzId: undefined
        },
        tableHeader: [],
        rules: {},
        commitStatus: false
      }
    },
    created() {
      this.id = this.$route.query.id
      this.getClazzList()
    },
    methods: {
      getClazzList() {
        getClazzList(this.id).then((response) => {
          this.clazzNameOptions = response.payload
        })
      },
      handleFilter() {
        getClazzStudents(this.listQuery).then((response) => {
          this.list = response.payload
        })
      },
      handlerCreate() {
        this.resetTemp()
        this.commitStatus = false
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      resetTemp() {
        this.temp = {}
      },
      beforeUpload(file) {
        const isLt1M = file.size / 1024 / 1024 < 1

        if (isLt1M) {
          return true
        }

        this.$message({
          message: 'Please do not upload files larger than 1m in size.',
          type: 'warning'
        })
        return false
      },
      handleDelete() {

      },
      handleSuccess({results, header}) {
        this.eshow = false
        this.temp.tableData = results
        this.tableHeader = header
      },
      resetUpload() {
        this.tableHeader = []
        this.temp.tableData = []
        this.eshow = true
      },
      createData() {
        this.commitStatus = true
        const data = Object.assign({}, this.temp)
        data.id = this.id
        createClazz(data).then((response) => {
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Created Successfully',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
</script>

