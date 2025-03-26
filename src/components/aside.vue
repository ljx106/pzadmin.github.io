
<template>
   <el-menu
      :style="{ width: isCollapse ? '64px' : '230px'}"
      active-text-color="#ffd04b"
      background-color="#545c64"
      class="aside-container"
      :default-active="active"
      text-color="#fff"
      @open="handleOpen"
      @close="handleClose" 
      :collapse="isCollapse"
    >
        <p class="logo-lg">{{isCollapse? 'DIDI':'DIDI陪诊'}}</p>
        <TreeMenu :menuData = "menuData"/>
      </el-menu>
</template>



<script setup>
  import TreeMenu from './treeMenu.vue';
  import { useRouter } from 'vue-router';
  import { reactive, computed } from 'vue';
  import { useStore } from 'vuex';



  // 获取router和store实例
  const router = useRouter()
  const store = useStore()
  // const menuData = reactive(router.options.routes[0].children) 获取固定路由数据
  // 从store中获取动态路由数据
  const menuData = computed(() => store.state.menu.routerList) 
  const isCollapse = computed(() => store.state.menu.isCollapse)
  const active = computed(() => store.state.menu.menuActive)


  const handleOpen = () => {}
  const handleClose = () => {}
</script>


<style lang = "less" scoped>
.aside-container {
  height:100%;
  .logo-lg {
    font-size: 20px;
    text-align: center;
    color: #fff;
    height:50px;
    line-height:50px;
  }
}
</style>