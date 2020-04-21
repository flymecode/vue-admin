<template>
  <div class="app-container">
    <div class="filter-container">
      <!--      <el-input-->
      <!--        v-model="listQuery.title"-->
      <!--        placeholder=""-->
      <!--        style="width: 200px;"-->
      <!--        class="filter-item"-->
      <!--        @keyup.enter.native="handleFilter"-->
      <!--      />-->
      <el-select v-model="listQuery.type" placeholder="题型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in questionTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
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
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="100px"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="标题" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="题型" align="center" width="80px">
        <template slot-scope="{row}">
          <el-tag :type="tagTypes[row.questionType]">{{ row.questionType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="难度" align="center" width="200px">
        <template slot-scope="{row}">
          <svg-icon v-for="n in + row.difficulty" :key="n" icon-class="star" class="meta-item__icon"/>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            详情
          </el-button>
          <el-button type="primary" size="mini">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="fetchQuestionList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="题型" prop="questionType">
          <el-select v-model="temp.questionType" class="filter-item" placeholder="Please select">
            <el-option
              v-for="item in questionTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" :autosize="{ minRows: 2, maxRows: 4}" type="textarea"/>
        </el-form-item>
        <div v-if="temp.questionType == 0">
          <el-form-item label="选项A" prop="optionA">
            <el-input v-model="temp.optionA" :autosize="{ minRows: 2, maxRows: 4}" type="textarea"/>
          </el-form-item>
          <el-form-item label="选项B" prop="optionB">
            <el-input v-model="temp.optionB" :autosize="{ minRows: 2, maxRows: 4}" type="textarea"/>
          </el-form-item>
          <el-form-item label="选项C" prop="optionC">
            <el-input v-model="temp.optionC" :autosize="{ minRows: 2, maxRows: 4}" type="textarea"/>
          </el-form-item>
          <el-form-item label="选项D" prop="optionD">
            <el-input v-model="temp.optionD" :autosize="{ minRows: 2, maxRows: 4}" type="textarea"/>
          </el-form-item>
        </div>

        <el-form-item label="答案" prop="answer">
          <el-input v-model="temp.answer"/>
        </el-form-item>
        <el-form-item label="分值" prop="score">
          <el-input v-model="temp.score" type="number"/>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-rate v-model="temp.difficulty" style="margin-top:8px;"/>
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

  </div>
</template>

<script>
  import waves from '@/waves'
  import {parseTime} from '@/utils'
  import Pagination from '@/components/Pagination'
  import {fetchQuestionList, createQuestion, updateQuestion} from '@/api/question'
  import {questionTypeOptions, questionTypeKeyValue} from '@/utils/question-type'

  const tagTypes = ['', 'info', 'success', 'warning']

  export default {
    name: 'QuestionManager',
    components: {Pagination},
    directives: {waves},
    filters: {
      typeFilter(type) {
        return questionTypeKeyValue[type]
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
          difficulty: undefined,
          type: undefined,
          course: undefined,
          sort: '+id'
        },
        questionTypeOptions,
        tagTypes,
        sortOptions: [{label: 'ID Ascending', key: '+id'}, {label: 'ID Descending', key: '-id'}],
        temp: {
          id: undefined,
          difficulty: undefined,
          title: '',
          questionType: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '创建'
        },
        rules: {
          type: [{required: true, message: 'type is required', trigger: 'change'}],
          timestamp: [{type: 'date', required: true, message: 'timestamp is required', trigger: 'change'}],
          title: [{required: true, message: 'title is required', trigger: 'blur'}]
        },
        downloadLoading: false
      }
    },
    created() {
      this.fetchQuestionList()
    },
    methods: {
      fetchQuestionList() {
        this.listLoading = true
        fetchQuestionList(this.listQuery).then(response => {
          this.list = response.payload.list
          this.total = response.payload.total
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.fetchQuestionList()
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
        this.temp = {}
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
            console.log(this.temp)
            createQuestion(this.temp).then(() => {
              this.fetchQuestionList()
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
          const tHeader = ['name', 'grade', 'clazz', 'id']
          const filterVal = ['name', 'grade', 'clazz', 'id']
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
