<template>
    <panel-head :route="route" />

    <div class="form">
        <el-form :model="searchForm" inline="true">
            <el-form-item prop="out_trade_no">
                <el-input v-model="searchForm.out_trade_no" placeholder="请输入订单号" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">查询</el-button>
            </el-form-item>
        </el-form>
    </div>


    <el-table :data="tableData.list" style="width: 100%"  @selection-change="handleSelectionChange">
        <el-table-column prop="out_trade_no" label="订单号" width="150" fixed="left"/>
        <el-table-column prop="hospital_name" label="就诊医院" />
        <el-table-column prop="service_name" label="陪诊服务" />
        <el-table-column label="陪诊师头像" >
            <template #default="scope">
                <el-image :src="scope.row.companion.avatar"  style="width: 40px; height: 40px;" />
            </template>
        </el-table-column>
        <el-table-column label="陪诊师手机号" width="120">
            <template #default="scope">
                {{ scope.row.companion.mobile }}
            </template>
        </el-table-column>
        <el-table-column prop="price" label="总价" />
        <el-table-column prop="paidPrice" label="已付" />
        <el-table-column label="下单时间" width="120">
            <template #default="scope">
                {{ scope.row.order_start_time }}
            </template>
        </el-table-column>
        <el-table-column label="订单状态" >
            <template #default="scope">
                <el-tag :type="statusMap(scope.row.trade_state)">{{ scope.row.trade_state }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column prop="service_state" label="接单状态" />
        <el-table-column prop="tel" label="联系人手机号" width="120" />
        <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
                <el-popconfirm 
                    v-if="scope.row.trade_state === '待服务'" 
                    confirm-button-text="是" 
                    cancel-button-text="否"
                    :icon="InfoFilled" 
                    icon-color="#626AEF" 
                    title="是否确认删除？"
                    @confirm="confirmEvent(scope.row.out_trade_no)"
                >
                    <template #reference>
                        <el-button type="primary" link>服务完成</el-button>
                    </template>
                </el-popconfirm>
                <el-button v-else type="primary" link disabled>暂无服务</el-button>
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
    

</template>



<script setup>
    import { reactive, onMounted } from 'vue' 
    import { adminOrder, updateOrder } from '../../../api/index'
    import { useRouter, useRoute } from 'vue-router'
    import dayjs from 'dayjs'

    const router = useRouter()
    const route = useRoute()

    onMounted( () =>{
        // adminOrder().then( ({data}) => {
        //     fileList.value = data.data
        // })
        getListData()
    })

    const paginationData = reactive({
      pageNum: 1,
      pageSize: 10
    })
    // 列表数据
    const tableData = reactive({
        list: [],
        total: 0,
    })

    //表单搜索
    const searchForm = reactive({
        out_trade_no: '',
    })

    // 请求列表
    const getListData = (params = {}) => {
        adminOrder({...paginationData, ...params}).then(({data}) => {
            const { list, total } = data.data
            list.forEach(item =>{
            item.order_start_time = dayjs(item.order_start_time).format('YYYY-MM-DD')
            })
            tableData.list = list
            tableData.total = total
            console.log(tableData, 'adminOrder-tableData')
        })
    }

    const statusMap = (key) => {
        const obj = {
            '已取消':'info',
            '已完成':'success',
            '待支付':'warning'
        }
        return obj[key]
    }

    // 确认服务完成
    const confirmEvent = (id) =>{
        updateOrder(id).then(({data}) => {
            if (data.code === 10000)
            {
                getListData()
            }
        })
    }

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

    // 提交搜索
    const onSubmit = () => {
        getListData(searchForm)
    }
</script>


<style lang="less" scoped>
    .form {
        display: flex;
        justify-content: flex-end;
        padding: 10px 0 10px 10px;
        background-color: #fff
    }
</style>
