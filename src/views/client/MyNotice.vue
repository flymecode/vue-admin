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
      <el-table-column label="标题" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center">
        <template slot-scope="{row}">
          <span>{{ row.content }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import waves from '@/waves'
  import {getNotices} from '@/api/notice'

  export default {
    name: 'MyNotice',
    directives: {waves},
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        dialogFormVisible: false,
      }
    },
    created() {
      this.getNotices()
    },
    methods: {
      getNotices() {
        this.listLoading = false
        getNotices().then(response => {
          this.list = response.payload
          this.total = this.list.length
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
    }
  }
</script>
