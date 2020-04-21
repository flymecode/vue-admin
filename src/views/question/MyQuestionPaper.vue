<template>
  <div class="app-container">
    <div class="filter-container">
<!--      <el-input-->
<!--        v-model="listQuery.name"-->
<!--        placeholder=""-->
<!--        style="width: 200px;"-->
<!--        class="filter-item"-->
<!--        @keyup.enter.native="handleFilter"-->
<!--      />-->
<!--      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">-->
<!--        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>-->
<!--      </el-select>-->
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

      <el-table-column label="名称" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="getQuestions(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="课程名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.courseName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="getQuestions(row)">
            详情
          </el-button>
<!--          <el-button type="danger" size="mini" @click="handleDelete(row)">-->
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
      @pagination="fetchPaperList"
    />

    <el-dialog :visible.sync="dialogQuestionsVisible" :fullscreen="true">
      <question-paper :questions="questions" :title="paperTitle"/>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogQuestionsVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import waves from '@/waves'
  import Pagination from '@/components/Pagination'
  import {fetchPaperList} from '@/api/paper'
  import QuestionPaper from '@/components/QuestionPaper'
  import {questionTypeOptions, questionTypeKeyValue} from '@/utils/question-type'
  import {fetchQuestionsById} from '@/api/question'

  const tagTypes = ['', 'info', 'success', 'warning']

  export default {
    name: 'QuestionManager',
    components: {
      Pagination,
      QuestionPaper
    },
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
          name: undefined
        },
        questionTypeOptions,
        tagTypes,
        paperTitle: '',
        questions: [],
        sortOptions: [{label: 'ID Ascending', key: '+id'}, {label: 'ID Descending', key: '-id'}],
        temp: {
          id: undefined,
          difficulty: undefined,
          title: '',
          questionType: ''
        },
        dialogQuestionsVisible: false,
        dialogStatus: ''
      }
    },
    created() {
      this.fetchPaperList()
    },
    methods: {
      fetchPaperList() {
        this.listLoading = true
        fetchPaperList(this.listQuery).then(response => {
          this.list = response.payload.list
          this.total = response.payload.total
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.fetchPaperList()
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
          importance: 1,
          remark: '',
          timestamp: new Date(),
          title: '',
          status: 'published',
          type: ''
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogQuestionsVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      getQuestions(row) {
        this.paperTitle = row.name
        fetchQuestionsById(JSON.stringify(row.questions)).then(response => {
          this.questions = response.payload
          this.dialogQuestionsVisible = true
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
              this.dialogQuestionsVisible = false
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
        // 执行删除操作
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      },
      getSortClass: function (key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  }
</script>
