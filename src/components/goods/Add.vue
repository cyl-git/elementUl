<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <div style="height: 10px"></div>
    <el-card>
      <el-alert title="添加商品" type="info" center show-icon :closable="false">
      </el-alert>
      <div style="height: 20px"></div>
      <!--  步骤条区域 -->
      <el-steps
        :active="Number(activeIndex)"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <div style="height: 20px"></div>

      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          class="elTabsHeight"
          style="height: calc(100vh - 320px); overflow-y: auto"
          :before-leave="beforeTableLeave"
          @tab-click="tabClicked()"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input
                v-model="addForm.goods_price"
                type="number"
                class="NumInput"
              ></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                style="width: 300px"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cascaderProps"
                @change="handleChange()"
                clearable
              ></el-cascader>
            </el-form-item>
            <el-alert
              title="注意：只允许为三级分类添加商品！"
              type="error"
              show-icon
              :closable="false"
            >
            </el-alert>
            <div style="height: 15px"></div>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="subitem"
                  v-for="(subitem, i) in item.attr_vals"
                  :key="i"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!--点击上传图片开始-->
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
            <!--点击上传图片结束-->
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <div style="height: 20px"></div>
            <el-button type="primary" @click="addSubmit()">添加商品</el-button>
          </el-tab-pane>
          <el-tab-pane label="完成" name="5">完成</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="80%">
      <img :src="previewPath" width="100%" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash' //一个深拷贝对象的包
export default {
  data() {
    return {
      //1、激活的tab标签的name
      activeIndex: '0',
      //2、添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      //3、添加商品的表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      },
      //4、商品分类列表
      catelist: [],
      //5、选择到的商品分类id,是一个数组
      selectedCateKeys: [],
      //6、级联选择器的配置项
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: false,
        value: 'cat_id', //选中的值来源
        label: 'cat_name', //下拉框的文字
        children: 'children', //
      },
      //7、动态参数面板中的参数列表
      manyTableData: [],
      //8、静态属性面板中的静态属性
      onlyTableData: [],

      //9、uploadURL 上传商品图片的路径
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      //10、图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      //11、图片预览的对话框
      dialogVisible: false,
      //12、预览的大图
      previewPath: '',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //1、获取商品分类数据，用于渲染分类级联选择器
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.catelist = res.data
    },
    //2、商品分类的级联选择器
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat.length = []
      }
    },
    //3、tab切换时候的判断
    beforeTableLeave(activeName, oldActiveName) {
      /*  console.log(`离开${oldActiveName},进入${activeName}`)
      return false
 */
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.success('请先选择商品分类，再切换')
        return false
      }
    },
    //4、tab页签被选中时候的出发
    async tabClicked(val) {
      //如果你点击的索引是1，说明你要访问的是动态参数面板，要发起对应的获取动态参数的ajax的请求
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only',
            },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败')
        }

        this.onlyTableData = res.data
      }
    },
    //5、删除商品图片触发的事件 file是将要被移除的那张图片的信息
    handleRemove(file, fileList) {
      //step1、 获取将要删除的图片的临时路径，file对象中有
      //step2、从pics数组中，找到这个图片对应的索引
      //step3、根据这个索引，删除对应的pic对象
      const filePath = file.response.data.tmp_path
      const fileIndex = this.addForm.pics.findIndex((item) => {
        item.pic === filePath
      })
      this.addForm.pics.splice(fileIndex, 1)
    },
    //6、点击商品图片列表中已上传的图片时的钩子,预览图片
    handlePreview(file) {
      console.log(file)
      this.dialogVisible = true
      this.previewPath = file.response.data.url
    },
    //7、图片上传成功后，会触发这个函数，在这里可以将服务器返回的图片路径，保存在data中。
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    //8、点击添加商品按钮，完成表单的预验证，预验证通过的话，就可以发起添加商品的数据请求
    addSubmit() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        //执行添加的业务逻辑

        //深拷贝一份addform对象数据，来将商品分类的id处理成一个以','分割的字符串，因为商品分类级联选择器需要数组，所以我们需要申拷贝一份数据，再处理goods_cat
        const newAddForm = _.cloneDeep(this.addForm)
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')
        //然后再处理attrs这个数组
        this.manyTableData.forEach((item) => {
          const manyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(manyInfo)
        })
        this.onlyTableData.forEach((item) => {
          const onlyInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          }
          this.addForm.attrs.push(onlyInfo)
        })
        newAddForm.attrs = this.addForm.attrs

        //将配置对象设置好，就可以发起添加商品的数据请求了
        const { data: res } = await this.$http.post('goods', newAddForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }

        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cateId: function () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.NumInput /deep/.el-input__inner {
  padding-right: 0;
}
.el-upload__tip {
  color: #f00;
}
</style>