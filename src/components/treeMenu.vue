<template>
  <template v-for="(item) in props.menuData">
    <el-menu-item 
    :style="{ width: '230px'}"
      @click="handleClick(item, `${props.index}-${item.meta.id}`)"
      v-if="!item.children || item.children.length == 0"
      :index="`${props.index}-${item.meta.id}`" 
      :key="`${props.index}-${item.meta.id}`">
  <!-- 若二级菜单为空或二级菜单长度为0，按此方式渲染 -->
  <el-icon size="20">
        <component :is="item.meta.icon"></component>
      </el-icon>
      <span>{{ item.meta.name }}</span>
    </el-menu-item>
    <el-sub-menu v-else :index="`${props.index}-${item.meta.id}`" :key="`${props.index}-${item.meta.name}`">
  <!-- 若二级菜单不为空，按此方式渲染 -->
  <template #title>
        <el-icon size="20">
          <component :is="item.meta.icon"></component>
        </el-icon>
        <span>{{ item.meta.name }}</span>
      </template>
      <tree-menu :index="`${props.index}-${item.meta.id}`" :menuData="item.children" />
    </el-sub-menu>
  </template>
  

</template>


<script setup>
import { useRouter } from 'vue-router'
import { useStore} from 'vuex'

const store = useStore()
const props = defineProps(["menuData",'index'])
const router = useRouter()

const handleClick = (item, active)=>{ 
  store.commit('addMenu',item.meta)
  store.commit('updateMenuActive',active)
  router.push(item.meta.path)
  // 点击跳转
}
</script>


<style scoped>

</style>
