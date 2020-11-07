<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <el-card>
      <el-button type="primary" @click="showAddCateDialog()">
        添加分类</el-button
      >
      <div style="height: 10px"></div>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
      >
        <!-- 模板列--是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cat_deleted"
            style="color: green"
          >
          </i>
          <i class="el-icon-circle-close" v-else style="color: red"> </i>
        </template>

        <!-- 模板列--排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="primary" plain
            >一级</el-tag
          >
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" plain
            >二级</el-tag
          >
          <el-tag v-else type="warning" plain>三级</el-tag>
        </template>

        <!-- 模板列--操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            @click="editCate(scope.row.cat_id)"
            >编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="removeCate(scope.row.cat_id)"
            >删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
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
    <!-- 添加商品分类的对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="cateDialogVisible"
      width="30%"
      @close="addCateDialogClose()"
    >
      <!--  内容区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="120px"
      >
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="partentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 50px"></div>

      <!-- 底部操作区 -->
      <span slot="footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定 </el-button>
      </span>
    </el-dialog>

    <!-- 编辑商品分类的对话框 -->
    <el-dialog
      title="编辑商品分类"
      :visible.sync="editCateDialogVisible"
      width="30%"
    >
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="120px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作区 -->
      <span slot="footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSubbit()">确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类数据列表
      catelist: [],
      //添加商品的表单数据
      addCateForm: {
        cat_name: '', //分类名称
        cat_pid: 0, //分类的父id
        cat_level: 0, //0是一级分类，1是二级分类，2是三级分类
      },
      //编辑商品分类
      editCateForm: {},
      //查询条件，申请数据列表时候的传参
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0, //总数据
      selectedKeys: [], //选中的父菜单 id ,一级和二级id
      parentCateList: [], //父级分类的全部数据
      //指定添加分类的父级分类的选择器配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效', //列名
          type: 'template', //将当前列定义为模板列
          template: 'isok', //设置当前模板列的名称
        },
        {
          label: '排序', //列名
          type: 'template', //将当前列定义为模板列
          template: 'order', //设置当前模板列的名称
        },
        {
          label: '操作', //列名
          type: 'template', //将当前列定义为模板列
          template: 'opt', //设置当前模板列的名称
        },
      ], //为tree-table 指定列的定义
      cateDialogVisible: false, //添加分类的对话框显示不显示
      editCateDialogVisible: false, //编辑商品分类的对话框显示或不显示
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    //切换每页显示几条
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    // 切换当前页
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    //点击添加分类按钮
    showAddCateDialog() {
      this.getParentCateList()
      this.cateDialogVisible = true
    },
    //获取父级的分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2,
        },
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentCateList = res.data
    },
    //添加分类选择父分类下拉框触发
    partentCateChanged() {
      //如果this.selectedKeys这个数组的长度大于0，证明选中了父级分类
      //反之，就是没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //点击添加分类的确定按钮  发起添加请求
    addCate() {
      //当点击确定 按钮之前  先对表单数据进行预验证，当预验证通过之后就可以发起添加请求 然后重新获取数据列表就好了
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }

        this.getCateList()

        this.cateDialogVisible = false
      })
    },
    //监听添加分类的对话框，重置表单
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    //编辑商品分类
    async editCate(id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    //编辑商品分类提交按钮
    editCateSubbit() {
      this.$refs.editCateFormRef.validate((valid, val) => {
        if (!valid) return
        this.$http
          .put(`categories/${this.editCateForm.cat_id}`, {
            cat_name: this.editCateForm.cat_name,
          })
          .then((result) => {
            const { data: res } = result
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }
            //1、关闭对话框
            this.editCateDialogVisible = false
            //2、更新数据列表

            this.getCateList()
            //3、提示修改商品分类信息成功
            this.$message.success(res.meta.msg)
          })
      })
    },
    //删除商品分类
    removeCate(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`categories/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除商品分类失败')
          }
          this.$message.success('删除商品分类成功！')
          this.getCateList()
        })
        .catch(() => {
          this.$message.info('您已经取消删除用户！')
        })
    },
  },
}
</script>
<style lang="scss" scoped>
</style>