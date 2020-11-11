<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <div style="height: 15px"></div>

      <el-form label-width="100px" width="100%">
        <el-form-item label="选择商品分类">
          <el-cascader
            style="width: 300px"
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="handleChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态数据" name="many">
          <el-button
            type="primary"
            size="small"
            :disabled="selectedCateKeys.length == 0"
            @click="addParamsDialogVisible = true"
            >添加参数
          </el-button>
          <div style="height: 10px"></div>
          <!--  动态参数表格 -->
          <el-table :data="manyTableData" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag 标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  :disable-transitions="true"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加tag的输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加tag的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>

            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="editParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >

                <el-button
                  type="danger"
                  size="small"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
                <p>{{ scope.row }}</p>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="small"
            :disabled="selectedCateKeys.length == 0"
            @click="addParamsDialogVisible = true"
            >添加属性
          </el-button>

          <div style="height: 10px"></div>
          <!--  静态属性表格 -->
          <el-table :data="onlyTableData" border stripe style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag 标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  :disable-transitions="true"
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加tag的输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加tag的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>

            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="editParamsDialog(scope.row.attr_id)"
                  >编辑</el-button
                >

                <el-button
                  type="danger"
                  size="small"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
                <p>{{ scope.row }}</p>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 1、添加参数对话框 -->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addParamsDialogVisible"
      width="30%"
      @close="addParamsDialogClose()"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="120px"
      >
        <el-form-item :label="titleText.slice(2) + '名称'" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作区 -->
      <span slot="footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParamsSubmit()">确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 2、编辑参数对话框 -->
    <el-dialog
      :title="`编辑${titleText}`"
      :visible.sync="editParamsDialogVisible"
      width="30%"
      @close="editParamsDialogClose()"
    >
      <el-form
        :model="editParamsForm"
        :rules="addParamsFormRules"
        ref="editParamsFormRef"
        label-width="120px"
      >
        <el-form-item :label="titleText.slice(2) + '名称'" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
        <!-- 底部操作区 -->
      </el-form>
      <span slot="footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamsSubbit()">确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      selectedCateKeys: [], //选中的商品分类id 是一个数组
      catelist: [], //商品分类列表
      activeName: 'many',
      manyTableData: [], //动态参数数据
      onlyTableData: [], //静态属性数据
      addParamsDialogVisible: false, //添加参数对话框的显示
      editParamsDialogVisible: false, //编辑参数名称对话框的显示
      //添加参数表单对象
      addParamsForm: {
        attr_name: '',
      },
      editParamsForm: {},
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: false,
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类列表，渲染级联选择器
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.catelist = res.data
    },
    //发起请求 获取动态参数或者静态属性
    async getParamsDate() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      /* 在这里发起获取数据的请求 */
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    //级联选择框选中项发生变化，会触发这个函数的执行
    handleChanged() {
      this.getParamsDate()
    },

    //点击切换 tab标签时候触发这个函数
    handleClick() {
      this.getParamsDate()
      /* this.clearAllData() */
    },

    //编辑动态参数按钮
    editManyParams() {},
    //编辑静态属性按钮
    editOnlyParams() {},
    //监听添加对话框的关闭事件，用来重置添加表单
    addParamsDialogClose() {
      this.$refs.addParamsFormRef.resetFields()
    },
    //监听编辑对话框的关闭事件，用来重置编辑表单
    editParamsDialogClose() {
      this.$refs.editParamsFormRef.resetFields()
    },
    //添加参数确定按钮，发起添加数据的ajax请求
    addParamsSubmit() {
      this.$refs.addParamsFormRef.validate((valid, val) => {
        if (!valid) return
        this.$http
          .post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName,
          })

          .then((result) => {
            const { data: res } = result
            if (res.meta.status !== 201) {
              return this.$message.error(res.meta.msg)
            }
            this.addParamsDialogVisible = false
            this.getParamsDate()
            this.$message.success(res.meta.msg)
          })
      })
    },
    //编辑参数对话框，根据当前参数id和分类id来发起查询的请求，然后修改数据，保存到数据库
    async editParamsDialog(attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },

    //提交编辑按钮
    editParamsSubbit() {
      this.$refs.editParamsFormRef.validate((valid, val) => {
        if (!valid) return
        this.$http
          .put(
            `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
            {
              attr_name: this.editParamsForm.attr_name,
              attr_sel: this.activeName,
            }
          )
          .then((result) => {
            const { data: res } = result
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }

            //1、关闭对话框
            this.editParamsDialogVisible = false
            //2、更新数据列表

            this.getParamsDate()
            //3、提示修改商品分类信息成功
            this.$message.success(res.meta.msg)
          })
      })
    },
    //根据id 删除参数行
    removeParams(attrId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attrId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败')
          }
          this.$message.success('删除参数成功！')
          this.getParamsDate()
        })
        .catch(() => {
          this.$message.info('您已经取消删除用户！')
        })
    },
    // tag编辑标签 文本框失去焦点或者按下了enter键都会出发
    handleInputConfirm(row) {
      //如果输入的内容全部是空格 那么需要把input 重置为空 并且隐藏input输入框
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果输入的是正确的数据，先保存在前端直接显示在页面上
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      //////////////

      this.saveAttrVals(row)
    },
    //点击 添加tag 变成输入框
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //发起网络请求，修改参数tag数据
    async saveAttrVals(row) {
      //同时需要发起ajax把数据同步到后端数据库中，防止刷新页面，数据丢失
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' '),
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功')
    },
    //关闭tag便签时，触发这个函数
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    },
  },
  computed: {
    //计算得到当前三级分类的商品id,为了在下拉菜单中根据id 发起获取数据的请求
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    //动态计算添加参数的对话框标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>