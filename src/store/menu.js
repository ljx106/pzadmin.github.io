const localData = localStorage.getItem('pz_v3pz')
const state = localData ? localData.menu:{
    isCollapse: false,
    selectMenu: [],
    routerList: [],
    menuActive: '1-1'
}

const mutations = {
    // mutation函数中，state默认是第一个参数，payload是调用处传递的参数
    collapseMenu(state) {
        state.isCollapse = !state.isCollapse
    },
    addMenu (state, paypload) {
        // 顶部菜单一一对应菜单内容，需数据去重
        // 对于不存在的菜单，需添加
        if ( state.selectMenu.findIndex(item => item.name === paypload.name) === -1 ) {
            state.selectMenu.push(paypload)
        }
    },
    closeMenu(state, payload) {
        //找到点击数据的索引
        const index = state.selectMenu.findIndex(val => val.path === payload.path)
        //通过索引删除数据指定元素
        state.selectMenu.splice(index, 1)
    },
    dynamicMenu(state, payload) {
        //通过glob导入文件
        const modules = import.meta.glob('../views/**/**/*.vue')
        // console.log(modules)
        function routerSet(router) {
            router.forEach( route => {
                // 判断有无子菜单，当不存在子菜单时，开始拼接路由数据，否则递归访问子菜单
                if (!route.children) {
                    const url = `../views${route.meta.path}/index.vue`
                    route.component = modules[url]
                } else {
                    routerSet(route.children)
                }
            })
        }
        routerSet(payload)
        // console.log('payload', payload)
        // 拿到完整路由数据
        state.routerList = payload
    },
    updateMenuActive(state, payload) {
        state.menuActive = payload
    }
}
export default {
    state,
    mutations
}