<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <!--  卡片视图 -->
    <el-card>
      <el-button type="primary"> 添加角色 </el-button>
      <div style="height: 10px"></div>
      <el-table :data="rolesList" border stripe="">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限的 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)"
                  >{{ item1.authName }}
                </el-tag>
                &nbsp;&nbsp;<i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限的 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    &nbsp;&nbsp;<i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightsById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--  <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="small" type="primary">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="removeRole(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="small"
              type="success"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog
      title="分配权限"
      :visible.sync="assignRightsdialogVisible"
      width="30%"
      @close="setRightDialogClosed"
    >
      <!-- 内容区域 -->
      <el-tree
        ref="rightsTreeRef"
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :default-checked-keys="defKeys"
      ></el-tree>
      <!-- 操作区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRightsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      assignRightsdialogVisible: false,
      rolesList: [], //角色列表数据,
      rightsList: [], //所有权限数据,
      treeProps: {
        children: 'children',
        label: 'authName',
      },

      defKeys: [], //默认选中的结点id值
      roleId: '', //当前即将分配权限的角色id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    removeRightsById(roleInfo, rightID) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${roleInfo.id}/rights/${rightID}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.$message.success('删除权限成功！')
          roleInfo.children = res.data
        })
        .catch(() => {
          this.$message.info('您已经取消删除用户！')
        })
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      //把获取的权限数据保存到data中
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.assignRightsdialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    //点击为角色分配权限
    async allotRights() {
      let keys = [
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys(),
      ]

      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr,
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.assignRightsdialogVisible = false
    },
    //删除角色
    removeRole(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          this.$message.success('删除角色成功！')
          this.getRolesList()
        })
        .catch(() => {
          this.$message.info('您已经取消删除角色！')
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.el-tag {
  margin: 5px 5px 5px 0;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-row {
  display: flex;
  align-items: center;
}
</style>