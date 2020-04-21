<template>
  <div class="app-container">
    <div class="filter-container">
      <el-cascader
        v-model="listQuery.value"
        class="filter-item"
        :options="options"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        查找
      </el-button>
    </div>
    <span v-if="list == null">暂无数据</span>
    <el-card v-for="(item,index) in list" v-loading="loading" shadow="hover" style="margin: 20px;">
      <el-row :gutter="20">
        <el-tag>{{ item.name }}</el-tag>
        <el-tag>{{ item.courseName }}</el-tag>
        <el-tag>{{ item.clazzName }}</el-tag>
        <el-tag>{{ item.username }}</el-tag>
        <el-tag>{{ item.type | typeFilters }}</el-tag>
      </el-row>
      <div style="margin-top: 20px; color:#303133;">
        {{ item.reason }}
      </div>
      <el-row>
        <el-col :span="4" :offset="20">
          <div>
            <el-button v-waves type="primary" @click="handlerAgree(item.id,item.signId,index)">同意</el-button>
            <el-button v-waves type="danger" @click="handlerNoAgree(item.id)">驳回</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getReplys"
    />

    <el-dialog title="信息" :visible.sync="show">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="reply"
        label-position="left"
        label-width="80px"
        style=" margin-left:10px;"
      >
        <el-form-item label="意见">
          <el-input v-model="reply.message"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="show = false">
          取消
        </el-button>
        <el-button type="primary" @click="noAgree">
          提交
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import waves from '@/waves/index.js'
  import {getCourseAndClazz} from '@/api/course'
  import Pagination from '@/components/Pagination'
  import {getReplys, handlerAgree} from '@/api/reply'

  export default {
    name: 'Reply',
    components: {Pagination},
    directives: {
      waves
    },
    filters: {
      typeFilters(type) {
        const map = {
          1: '请假',
          2: '申诉'
        }
        return map[type]
      }
    },
    data() {
      return {
        list: null,
        total: 0,
        loading: true,
        listQuery: {
          page: 1,
          limit: 20
        },
        options: null,
        show: false,
        reply: {}
      }
    },
    created() {
      this.getCourseAndClazz()
      this.getReplys()
    },
    methods: {
      handlerAgree(id, signId, index) {
        handlerAgree({id: id, signId: signId}).then(() => {
          this.$notify({
            title: 'Success',
            message: 'Successfully',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
          this.total = this.total - 1
        })
      },
      handlerNoAgree(id) {
        this.show = true
        this.reply.id = id
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getReplys()
      },
      getReplys() {
        this.loading = false
        getReplys(this.listQuery).then((data) => {
          this.list = data.payload.list
          this.total = data.payload.total
          setTimeout(() => {
            this.loading = false
          }, 1.5 * 1000)
        })
      },
      getCourseAndClazz() {
        getCourseAndClazz().then((response) => {
          this.options = response.payload
        })
      },
      noAgree() {
        handlerNoAgree(this.reply).then(() => {

        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .app-container {
    .roles-table {
      margin-top: 30px;
    }

    .permission-tree {
      margin-bottom: 30px;
    }
  }
</style>
