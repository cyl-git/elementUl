<template>
  <div class="login_container">
    <div class="login">
      <div class="logo"><img src="../assets/logo.png" width="68" /></div>
      <div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="rules">
          <el-form-item prop="username">
            <el-input
              prefix-icon="el-icon-user"
              v-model="loginForm.username"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              prefix-icon="el-icon-lock"
              v-model="loginForm.password"
              type="password"
            ></el-input>
          </el-form-item>
          <el-form-item class="btn-s">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 12,
            message: '长度在 6 到 12 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
      this.loginForm.username = ''
      this.loginForm.password = ''
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('恭喜你登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  .login {
    width: 400px;
    height: 300px;
    background-color: #f7f7f7;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 20px;

    .logo {
      border: 1px solid #ddd;
      width: 108px;
      height: 108px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      margin-top: -40px;
      border-radius: 50%;
      background-color: beige;
    }
    .btn-s {
      text-align: right;
    }
  }
  .login /deep/ .el-form {
    margin-top: 20px;
  }
}
</style>