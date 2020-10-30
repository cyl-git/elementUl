<template>
  <el-container class="container">
    <!-- 头部 -->
    <el-header>
      <h3>
        <img
          src="../assets/logo.png"
          height="40"
        />ELEMENT电商后台管理系统&nbsp;&nbsp;&nbsp;&nbsp;
      </h3>
      <el-button size="mini" type="primary" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="togBut" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!--  一级菜单 -->
          <el-submenu
            :index="String(item.id)"
            v-for="item in menuList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconList[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!--  二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主要内容 -->
      <el-main><router-view></router-view></el-main>
    </el-container>
    <div class="footer">版权信息</div>
  </el-container>
</template>
<script>
/* import welcome from '../components/Welcome' */
export default {
  data() {
    return {
      menuList: [],
      iconList: {
        125: 'el-icon-eleme',
        103: 'el-icon-delete-solid',
        101: 'el-icon-s-tools',
        102: 'el-icon-setting',
        145: 'el-icon-user',
      },
      isCollapse: false,
      activePath: '', //被激活的链接地址
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  mounted() {},
  methods: {
    //退出功能
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    //获取左侧菜单数据
    getMenuList() {
      this.$http.get('menus').then((result) => {
        const { data: res } = result
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
      })
    },
    //切换左侧菜单的折叠展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存当前激活菜单的状态值，当页面刷新时候，从session中获取并赋给 el-meau中的 default-active
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = window.sessionStorage.getItem('activePath')
    },
  },
  components: {
    /* welcome, */
  },
}
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  color: #fff;
  text-align: center;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-header img {
  vertical-align: middle;
}
.footer {
  height: 30px;
  line-height: 30px;
  background-color: #eee;
  text-align: center;
  border-top: 1px solid #ddd;
}
.el-aside {
  background-color: #333744;
  color: #fff;
}

.el-main {
  background-color: #f7f7f7;
  color: #333;
  padding: 10px;
}
.el-menu {
  border-right: none;
}
.togBut {
  background-color: #4a5064;
  text-align: center;
  cursor: pointer;
}
</style>