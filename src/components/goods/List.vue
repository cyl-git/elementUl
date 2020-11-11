<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="18"
          ><el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <div style="height: 10px"></div>
      <!--商品列表区域-->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格"
          prop="goods_price"
          width="120px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="120px"
        ></el-table-column>
        <el-table-column label="创建时间" width="180px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280px">
          <template>
            <el-button type="primary">编辑</el-button>
            <el-button type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--  商品分页 -->
      <div style="height: 10px"></div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="width: 100%"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //1、 查询参数对象
      queryInfo: {
        query: '', //查询数据
        pagenum: 1, //当前页
        pagesize: 5, //每页几条数据
      },
      //2、商品列表数据
      goodslist: [],
      //3、商品总条数
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //1、获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get(`goods`, {
        params: this.queryInfo,
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.$message.success('获取商品列表成功')

      this.total = res.data.total
      console.log(this.goodslist)
    },
    //2、分页 改变条数
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    //3、 切换当前页
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    //4、点击添加商品，通过编程式导航跳转到添加商品的新组件页面
    goAddpage() {
      this.$router.push('/goods/add')
    },
  },
  computed: {},
}
</script>
<style lang="scss" scoped>
</style>