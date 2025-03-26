<template>
    <el-row class="login-container" justify="center" align="middle">
        <el-card style="max-width: 480px;">
            <template #header>
                <div class="card-header">
                    <img :src="imgUrl" alt="">
                </div>
            </template>
            <div class="jump-link">
                <el-link type="primary" @click="handleChange">{{ formType ? '返回登录' : '注册账号' }}</el-link>
            </div>
            <el-form ref="loginFormRef" :model="loginForm" style="max-width: 600px" class="demo-ruleForm"
                :rules="rules">
                <el-form-item prop="userName">
                    <el-input v-model="loginForm.userName" placeholder="手机号" :prefix-icon="UserFilled"></el-input>
                </el-form-item>
                <el-form-item prop="passWord">
                    <el-input v-model="loginForm.passWord" type="password" placeholder="密码"
                        :prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item v-if="formType" prop="validCode">
                    <el-input v-model="loginForm.validCode" placeholder="验证码" :prefix-icon="Lock"> 
                        <template #append>
                            <span @click="countdownChange">{{ countdown.validText }}</span>
                        </template>
                    </el-input>

                </el-form-item>
            </el-form>
            <el-form-item>
                <el-button type="primary" :style="{ width: '100%' }" @click="submitForm(loginFormRef)">
                    {{ formType ? '注册' : '登录' }}
                </el-button>
            </el-form-item>
        </el-card>
    </el-row>
</template>


<script setup>
import { ref, reactive, computed, toRaw } from 'vue'
import { getCode, userAuthentication, login, menuPermissions } from '../../api'
//导入element-plus图标组件
import { UserFilled, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const imgUrl = new URL('../../../public/login-head.png', import.meta.url).href
const formType = ref(0) //记录表单状态，0登录，1注册
const loginFormRef = ref()

const router = useRouter()
const store = useStore()

const routerList = computed(() => store.state.menu.routerList)

// 表单提交
const submitForm = async (formEl) => {
    if (!formEl) return
    //  手动触发表单验证
    await formEl.validate((valid, fields) => {
        if (valid) {
            console.log(loginForm,'submit!')
            // 注册页面
            if (formType.value) {
                userAuthentication(loginForm).then(({data}) => {
                    if (data.code == '10000') {
                        ElMessage.success('注册成功，请登录')
                        formType.value = 0
                    }
                })
            } else {
                // 登录页面
                login(loginForm).then(({data}) => {
                    if (data.code == '10000') {
                        ElMessage.success('登录成功')
                        console.log(data,'data')
                        // 将token和用户信息缓存到浏览器
                        localStorage.setItem('pz_token', data.data.token)
                        localStorage.setItem('pz_userInfo', JSON.stringify(data.data.userInfo))
                        menuPermissions().then(({ data }) => {
                            store.commit('dynamicMenu', data.data) 
                            //  dynamic函数属于vuex中的mutation事件函数，须以此种方式调用
                            // console.log('routerList',routerList)
                            toRaw(routerList.value).forEach( item =>{
                                router.addRoute('main',item)
                        })
                            router.push('/')
                        })
                    }
                })
            }
        } else {
            console.log('error submit!', fields)
        }
        //  表单提交逻辑
        //...
    })
}
// 表单数据
const loginForm = reactive({
    loginForm: { 
        username: '',
        password: '',
        validCode: ''
    }
})

// 切换表单 （0登录，1注册）
const handleChange = () => {
    formType.value = !formType.value
}

// 账号校验规则
const validateUser = (rule, value, callback) =>{
    // 不为空
    if (!value) {
        callback(new Error('请输入手机号'))
    } else {
        const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
        phoneReg.test(value) ? callback() : callback(new Error('手机号格式错误，请输入正确的手机号'))
    }
}

// 密码校验
const validatePass = (rule, value, callback) => {
    // 不为空
    if (!value) {
        callback(new Error('请输入密码'))
    } else {
        const passReg = /^[a-zA-Z0-9_-]{4,16}$/
        passReg.test(value) ? callback() : callback(new Error('密码格式错误,请输入4-16位字母、数字、下划线、减号'))
    }
}

// 表单验证
const rules = {
    userName: [{ validator: validateUser, trigger: 'blur' }],
    passWord: [{ validator: validatePass, trigger: 'blur' }]
}

// 发送验证码
const countdown = reactive({
    validText: '获取验证码',
    time: 60,
})

let flag = false //记录状态
const countdownChange = () => {
    //如果已发送了验证码，不处理，避免重复创建定时器
    if (flag) return
    //判断手机号是否正确
    const phoneReg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    if (!loginForm.userName || !phoneReg.test(loginForm.userName)) {
        return ElMessage({
            message: '请检查手机号是否正确',
            type: 'warning'
        })
    }
    //倒计时，这个地方有个bug，倒数为0时，重新赋值为60，会继续执行else语句
    const time = setInterval(() => {
        if (countdown.time <= 0) {
            countdown.time = 60
            countdown.validText = '获取验证码'
            flag = false
            clearInterval(time)
        } else {
            countdown.time -= 1
            countdown.validText = `剩余(${countdown.time})`
        }
    }, 1000)
    flag = true

    getCode({
        tel: loginForm.userName
    }).then(({ data }) => {
        console.log(data,'data')
        if (data.code === 10000) {
            ElMessage.success('发送成功')
        }
    })
}
</script>



<style lang="less" scoped>
:deep(.el-card__header) {
    padding: 0
  }
  .login-container {
    height: 100%;
    .card-header{
      background-color: #899fe1;
      height: 100%;
      img {
        width: 430px;
      }
    }
    .jump-link {
      text-align: right;
      margin-bottom: 10px;
    }
  }
</style>
