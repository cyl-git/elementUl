<template>
  <div>
    <h3>
      Home页面&nbsp;&nbsp;&nbsp;&nbsp;<el-button size="mini" @click="logout"
        >退出</el-button
      >
    </h3>
  </div>
</template>
<script>
export default {
  data() {
    return {}
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
  },
}
</script>
<style lang="scss" scoped>
</style>