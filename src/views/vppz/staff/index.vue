<template>
    <!-- <panel-head :route="route"/> -->
    <div class='btns'>
        <el-button :icon="Plus"  type="primary" @click="open(null)" size="small">新增</el-button>
        <el-popconfirm
            confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled" icon-color="#626AEF"
            title="是否确认删除？" @confirm="confirmEvent"
        >
            <template #reference>
                <el-button :icon="Delete" type="danger" size="small">删除</el-button>
            </template>
        </el-popconfirm>
    </div>

    <el-table :data="tableData.list" style="width: 100%"  @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="name" label="昵称" />
        <el-table-column label="头像" >
            <template #default="scope">
                <el-image
                    style="width: 50px; height: 50px"
                    :src="scope.row.avatar"
                />
            </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别" >
            <template #default="scope">
                {{ scope.row.sex === '1' ? '男' : '女' }}
            </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column prop="active" label="状态" >
            <template #default="scope">
              <el-tag :type="scope.row.active ? 'success':'danger'">{{ scope.row.activate ? '正常':'失效' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="创建时间" >
            <template #default="scope">
              <div class="flex-box">
                <el-icon><Clock /></el-icon>
              <span style="margin-left : 10px">{{ scope.row.create_time  }}</span>
              </div>
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template #default="scope">
                <el-button type="primary" @click="open(scope.row)">编辑</el-button>
            </template>
        </el-table-column>
    </el-table>

    <div class="pagination-info">
        <el-pagination 
        v-model:current-page="paginationData.pageNum" 
        :page-size="paginationData.pageSize"
        :background="false" 
        layout="total, prev, pager, next" 
        :total="tableData.total"
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
        size="small" />
    </div>

    <el-dialog 
        v-model="dialogFormVisable"
        :before-close="beforeClose"
        title="陪护师编辑"
        width="500"
    >
    <el-form
            ref="formRef"
            label-width="100px"
            label-position="left"
            :model="form"
            :rules="rules"
            >
            <el-form-item v-show= "false" prop ="id">
                <el-input v-model="form.id" />
            </el-form-item>

            <el-form-item label="昵称" prop="name">
                <el-input v-model="form.name" placeholder="请输入昵称"/>
            </el-form-item>

            <el-form-item label="头像" prop="avatar">
                <el-button v-if="!form.avatar" type='primary' @click="openImg()">点击上传</el-button>
                <el-image 
                v-else
                :src="form.avatar"
                style="width : 148px; height: 148px"
                />
            </el-form-item>

            <el-form-item label="性别" prop="sex">
                <el-select v-model="form.sex" placeholder = "请选择性别" >
                    <el-option label="男" value="1" />
                    <el-option label="女" value="2" />
                </el-select>
            </el-form-item>

            <el-form-item label="年龄" prop="age">
                <el-input-number v-model="form.age" :min="18" :max="50" />
            </el-form-item>

            <el-form-item label="手机号" prop="mobile">
                <el-input v-model="form.mobile" placeholder="请填写手机号"/>
            </el-form-item>

            <el-form-item label="是否生效" prop="active">
                <el-radio-group v-model="form.active">
                    <el-radio :value="1">生效</el-radio>
                    <el-radio :value="0">失效</el-radio>
                </el-radio-group>
            </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="confirm(formRef)">确认</el-button>
                </div>
            </template>
    </el-dialog>
    <el-dialog 
        v-model="dialogImgVisable"
        :before-close="beforeClose"
        title="头像选择"
        width="680px"
    >
    <div class="image-list">
        <div v-for=" (item, index) in fileList.value" :key="item.name" class="img-box" @click="selectIndex = index">
            <div v-if="selectIndex === index" class="select">
                <el-icon color="#fff"> <Check /></el-icon>
            </div>
            <el-image
                :src="item.url"
                style="width: 148px; height: 148px"
            /> 
        </div>
    </div> 

    <template #footer>
        <div class="dialog-footer">
            <el-button @click="dialogImgVisable=false">取消</el-button>
            <el-button type="primary" @click="confirmImage()">选择</el-button>
        </div>
    </template>
    </el-dialog>

    
</template>

<script setup>
    import { reactive, ref,onMounted, nextTick  } from 'vue';
    import { Plus, Check, InfoFilled, Delete } from '@element-plus/icons-vue';
    import { useRoute } from 'vue-router';
    import { photoList, companion, companionList, deleteCompanion } from '../../../api'
    import { ElMessage } from 'element-plus';
    import  dayjs  from "dayjs";


    onMounted( () =>{
        photoList().then( ({data}) => {
            fileList.value = data.data
        })
        getListData()
    })


    const dialogFormVisable = ref(false)
    const fileList = reactive([])
    const selectIndex = ref(0)


    const beforeClose = (done) => {
        dialogFormVisable.value = false
        formRef.value.resetFields()
        }
    const formRef = ref()

    const form = reactive({
        id: '',
        name: '',
        mobile: '',
        active:1,
        avatar: '',
        sex: '',
        age: '',
    })


    const open = (rowData) => {
        dialogFormVisable.value = true
        nextTick(() => {
            //如果是编辑
            if (rowData) {
                Object.assign(form, rowData)
            }
        })
    }

        
    const confirm = async (formEl) => {
            if (!formEl) return 
            await formEl.validate((valid, fields) => {
                if (valid) {
                    companion(form).then(({data}) => {
                        if(data.code === 10000) {
                            ElMessage.success('操作成功')
                            beforeClose()
                            getListData()
                        }else {
                        ElMessage.error("data.msg")
                        }
                    })
                }else {
                    console.log('error submit!', fields)
                }
            })
    }

    const confirmImage = () => {
        form.avatar = fileList.value[selectIndex.value].url
        dialogImgVisable.value = false
    }
    const rules = reactive({
            name: [
                { required: true, message: '请输入昵称', trigger: 'blur' }
            ],
            avatar: [
                { required: true, message: '请选择头像'}
            ],
            sex: [
                { required: true, message: '请选择性别', trigger: 'change'}
            ],
            mobile: [
                { required: true, message: '请输入手机号', trigger: 'blur' }
            ],
        })

    // 头像选择弹窗
    const dialogImgVisable = ref(false)


    const openImg = () => {
        dialogImgVisable.value = true
    }

    const paginationData = reactive({
      pageNum: 1,
      pageSize: 10
    })
    // 列表数据
    const tableData = reactive({
            list: [],
            total: 0,
        })

    // 当前页码改变
    const handleSizeChange = (val) => {
        paginationData.pageSize = val
        getListData()
    }
    
    // 当前页码改变
    const handleCurrentChange = (val) => {
        paginationData.pageNum = val
        getListData()
    }

    // 选择
    const selectTableData = ref([])
    const handleSelectionChange = (val) => {
        console.log(val, 'handleSelectionChange')
        selectTableData.value = val.map(item => ({ id : item.id }))
    }

    // 确认删除
    const confirmEvent = () => {
        if (!selectTableData.value.length) {
            console.log(selectTableData.value.length, 'selectTableData')
            return ElMessage.warning('请选择要删除的数据')
        }
        deleteCompanion({ id : selectTableData.value}).then( ({data}) =>{
            if (data.code === 10000) {
                getListData()
            }
        })
    }

    // 请求列表
    const getListData = () => {
      companionList(paginationData).then(({data}) => {
        const { list, total } = data.data
        list.forEach(item =>{
          item.create_time = dayjs(item.create_time).format('YYYY-MM-DD')
        })
        tableData.list = list
        tableData.total = total
        console.log(tableData, 'companionList-tableData')
        })
    }

    

</script>


<style scoped>
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.image-list .img-box {
  position: relative;
}

.image-list .img-box .select {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 24px;
  height: 24px;
  background-color: #67c23a;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-list .el-image {
  margin-right: 10px;
  margin-bottom: 10px;
}

</style>
