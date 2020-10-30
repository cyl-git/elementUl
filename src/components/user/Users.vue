<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="6"
          ><el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <div style="height: 10px"></div>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border style="width: 100%" stripe size="small">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="250">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="180">
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            >
            </el-switch
          ></template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="small"
              type="primary"
              @click="editUser(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="removeUser(scope.row.id)"
              >删除</el-button
            >
            <el-button size="small" type="success">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="height: 10px"></div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="30%"
      @close="userDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->

    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <!-- 内容主题区域 -->
      <el-form
        :model="editForm"
        label-width="120px"
        ref="editFormRef"
        :rules="addFormRules"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserSubbit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/
      if (regEmail.test(value)) {
        //进入if条件说明，输入的是一个合法的邮箱了。
        return cb()
      }
      cb(new Error('请输入合法的邮箱！！！'))
    }
    //校验手机的自定义校验规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/
      if (regMobile.test(value)) {
        //进入if条件说明，输入的是一个合法的邮箱了。
        return cb()
      }
      cb(new Error('请输入正确的11位手机号码！！！'))
    }
    return {
      queryInfo: {
        query: '', //查询数据
        pagenum: 1, //当前页
        pagesize: 3, //每页几条数据
      },
      userlist: [], //当前请求页的用户列表数据
      total: 0, //总共几条数据
      dialogVisible: false,
      editDialogVisible: false,
      //添加用户的表单数据 加在el-form上
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '' /* 加在具体的表单项上 */,
      },
      editForm: {},
      //添加用户的表单验证规则 加在el-form上
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    //获取用户列表数据
    getUserList() {
      this.$http.get('users', { params: this.queryInfo }).then((result) => {
        const { data: res } = result
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userlist = res.data.users
        this.total = res.data.total
      })
    },
    //切换每页显示几条
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // 切换当前页
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    //监听当前用户状态
    userStateChanged(userInfo) {
      this.$http
        .put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        .then((result) => {
          const { data: res } = result
          if (res.meta.status !== 200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error(res.meta.msg)
          }
          this.$message.success(res.meta.msg)
        })
    },
    //监听添加用户的对话框关闭时候 重置表单
    userDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //监听编辑用户的对话框关闭时候 重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //添加用户确定按钮验证 validate是form提交时候的一个整体校验回调函数 ，传递2个参数，第一个参数是全部字段都通过校验了  就是 true 第二个字段就是  没有通过校验的字段 是一个对象哦！
    addUser() {
      this.$refs.addFormRef.validate((valid, val) => {
        if (!valid) return
        //这里可以添加真正的添加用户的网络请求了
        this.$http.post('users', this.addForm).then((result) => {
          const { data: res } = result
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.dialogVisible = false
          this.getUserList()
        })
      })
    },
    //编辑用户按钮
    async editUser(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.editDialogVisible = true
    },
    //编辑用户信息提交按钮
    editUserSubbit(id) {
      this.$refs.editFormRef.validate((valid, val) => {
        console.log(valid)
        console.log(val)
        if (!valid) return
        //这里可以发起修改用户信息的数据请求了
        this.$http
          .put(`users/${this.editForm.id}`, {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          })
          .then((result) => {
            const { data: res } = result
            console.log(res)
            if (res.meta.status !== 200)
              return this.$message.error(res.meta.msg)
            //1、关闭对话框
            this.editDialogVisible = false
            //2、更新数据列表
            this.getUserList()
            //3、提示修改用户信息成功
            this.$message.success(res.meta.msg)
          })
      })
    },
    //删除用户按钮
    removeUser(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.erroe('删除失败')
          }
          this.$message.success('删除用户成功！')
          this.getUserList()
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