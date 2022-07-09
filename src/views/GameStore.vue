<template>
  <div class="body" style="background-color: beige">
    <!--  开始页面  -->
    <template v-if="stage.start">
      <b style="font-size: 80px">便利店模拟器</b>
      <h3>开一家属于自己的便利店吧！</h3>
      <br/>
      <el-button @click="start" size="large" type="danger">开始</el-button>
    </template>
    <!--  状态栏  -->
    <template v-if="stage.state">
      <div style="position: absolute;top:40px;left: 10px">
        <div>
          <div style="display: flex;align-items: center;">
            <el-image :src="require('../assets/gameStore/金币.png')" style="width: 30px"></el-image>
            <b style="font-size: 20px;line-height: 20px">&nbsp{{ store.money }}</b>
          </div>
          <div style="display: flex;align-items: center">
            <el-image :src="require('../assets/gameStore/经验.png')" style="width: 30px"></el-image>
            <b style="font-size: 20px;line-height: 20px">&nbsp{{ store.level }}&nbsp({{ store.exp }}/{{
                store.expGoal
              }})</b>
          </div>
          <div style="display: flex;align-items: center">
            <el-image :src="require('../assets/gameStore/顾客.png')" style="width: 30px"></el-image>
            <b style="font-size: 20px;line-height: 20px">&nbsp{{ store.guest }}</b>
          </div>
          <div style="display: flex;align-items: center">
            <el-image :src="require('../assets/gameStore/库存.png')" style="width: 30px"></el-image>
            <b style="font-size: 20px;line-height: 20px">&nbsp{{ store.goodsAmount }}&nbsp{{
                '(' + store.shelves.length * 40 + ')'
              }}</b>
          </div>
        </div>
      </div>
    </template>
    <!--  地点选择  -->
    <template v-if="stage.location">
      <div class="tip">目前你拥有{{ store.money }}元，先开一家小店吧！</div>
      <div class="main">
        <el-button class="buttonNormal" @click="selectLocation(0)">{{
            location[0].description
          }}{{ location[0].name }}&nbsp¥{{ location[0].rentMoney }}/月
        </el-button>
        <el-button class="buttonNormal" @click="selectLocation(1)">{{
            location[1].description
          }}{{ location[1].name }}&nbsp¥{{ location[1].rentMoney }}/月
        </el-button>
      </div>
    </template>
    <!--  商店名称  -->
    <template v-if="stage.giveName">
      <div class="tip">便利店该叫什么呢？</div>
      <div class="main">
        <el-input size="large" v-model="store.name" maxlength="5"
                  input-style="font-size:20px;font-weight:bold;text-align:center">
          <template #append>
            便利店
          </template>
        </el-input>
        <el-button class="buttonNormal" @click="stage.giveName=false;stage.store=true">开始吧</el-button>
      </div>
    </template>
    <!-- 主界面  -->
    <template v-if="stage.store">
      <!--   招牌   -->
      <div
          style="width: 300px;height: 50px;border-width: 3px 3px 0 3px;border-style: solid;font-size: 25px;text-align: center;line-height: 35px">
        {{ store.name }}便利店<br/>
        <div style="font-size: 5px;line-height: 10px">{{ store.location.name }}</div>
      </div>
      <!--   主界面   -->
      <div
          style="width: 1120px;height: 605px;border-width: 3px 3px 3px 3px;border-style: solid;position: relative;font-size: 0">
        <!--    地板    -->
        <div style="width: 1120px;height:200px; display: flex;flex-wrap: wrap;position: absolute;left: 0;top:0 ">
          <div v-for="shelf in store.shelves" @click="stage.purchase=true">
            <!--            <img style="cursor: pointer" :src="require('../assets/gameStore/地板旧.jpg')" v-if="shelf.full"/><img style="height: 206px;cursor: pointer" :src="require('../assets/gameStore/地板旧.jpg')" v-if="!shelf.full"/>-->
            <el-image style="width:279px;height:200px;cursor: pointer" :src="require('../assets/gameStore/地板新.jpg')"
                      v-if="shelf.full"></el-image>
            <el-image style="width:279px;height:200px;cursor: pointer" :src="require('../assets/gameStore/地板新.jpg')"
                      v-if="!shelf.full"></el-image>
          </div>
        </div>
        <!--    货架    -->
        <div style="width: 1120px;height:200px; display: flex;flex-wrap: wrap;position: absolute;left: 0;top:0 ">
          <div v-for="shelf in store.shelves" @click="stage.purchase=true">
            <!--            <img style="cursor: pointer" :src="require('../assets/gameStore/地板旧.jpg')" v-if="shelf.full"/><img style="height: 206px;cursor: pointer" :src="require('../assets/gameStore/地板旧.jpg')" v-if="!shelf.full"/>-->
            <el-image class="shelfImg" style="height:200px;cursor: pointer"
                      :src="require('../assets/gameStore/货架满.png')"
                      v-if="shelf.full"></el-image>
            <el-image class="shelfImg" style="height:200px;cursor: pointer"
                      :src="require('../assets/gameStore/货架空.png')"
                      v-if="!shelf.full"></el-image>
          </div>
        </div>
        <!--    收银台    -->
        <el-image style="width:200px; display: flex;flex-wrap: wrap;position: absolute;left: 450px;bottom:0 "
                  :src="require('../assets/gameStore/收银员A.png')"></el-image>

      </div>
      <!--   菜单   -->
      <div style="position: absolute;bottom: 0;left: 0;display: flex;">
        <div class="menuButton" style="border-left-width: 3px" @click="stage.achieve=true">成就</div>
        <div class="menuButton">雇佣</div>
        <div class="menuButton">升级</div>
        <div class="menuButton" @click="stage.building=true">建造</div>
        <div class="menuButton" @click="stage.purchase=true">进货</div>
      </div>
      <!--   进货   -->
      <el-dialog v-model="stage.purchase" title="购买" center width="600px">
        <div class="goodsPurchase" v-for="item in goodsData">
          <el-image :src="item.icon" style="height: 50px;left: 0"></el-image>
          {{ item.name }}
          <span style="position: absolute;left: 200px">进价：{{ item.inputPrice }}</span>
          <el-input-number v-model="item.amount" size="small" style="position: absolute;left: 450px"
                           :min="0" :max="store.shelves.length * 40>store.goodsAmount?item.amount+1:item.amount"
                           @change="(currentValue, oldValue)=>purchase(currentValue, oldValue,item)"/>
        </div>
      </el-dialog>
      <!--   建造   -->
      <el-dialog v-model="stage.building" title="建造" center width="600px">
        <div class="buildingItem" @click="store.shelves.push({});store.money-=1000">
          <el-image :src="require('../assets/gameStore/货架空.png')" style="height: 50px;left: 0"></el-image>
          <span style="font-size: 30px;left: 100px;position: absolute">货架 ¥1000</span>
          <span style="font-size: 20px;right: 30px;position: absolute">摆放商品，吸引顾客</span>
        </div>
      </el-dialog>
      <!--   成就   -->
      <el-dialog v-model="stage.achieve" title="成就" center width="500px">
        <div class="achieveItem" v-for="item in store.achieve" :key="item.finish">
          <div style="font-size: 25px;left: 100px;">{{ item.name }}</div>
          <div style="font-size: 15px;left: 200px;position: absolute">{{ item.description }}</div>
          <div style="font-size: 15px;left: 400px;position: absolute;display: flex;align-items: center">
            <el-image :src="require('../assets/gameStore/经验值.png')" style="height: 15px"/>
            {{ item.ext }}
          </div>
          <div style="font-size: 15px;left: 450px;position: absolute;display: flex;align-items: center">
            <el-image :src="require('../assets/gameStore/成就完成.png')" style="height: 15px" v-if="item.finish"/>
            <el-image :src="require('../assets/gameStore/成就未完成.png')" style="height: 15px" v-if="!item.finish"/>
          </div>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import {ref, watch} from "vue";
import {ElNotification} from "element-plus";

export default {
  name: "GameStore",
  setup() {
    let stage = ref({
      start: false,
      state: true,
      location: false,
      giveName: false,
      store: true,
      purchase: false,
      building: false,
      achieve: false
    })

    let location = ref([{
      name: "郊区",
      description: "人烟稀少但租金便宜的",
      rentMoney: 1000
    }, {
      name: "小学",
      description: "小学生众多但租金稍贵的",
      rentMoney: 2000
    }])

    const goodsData = ref([
      {
        name: '薯片',
        inputPrice: 5,
        outPrice: 8,
        icon: require('../assets/gameStore/薯片.png'),
        amount: 0
      },
      {
        name: '饼干',
        inputPrice: 3,
        outPrice: 5,
        icon: require('../assets/gameStore/饼干.png'),
        amount: 0
      },
      {
        name: '巧克力',
        inputPrice: 6,
        outPrice: 10,
        icon: require('../assets/gameStore/巧克力.png'),
        amount: 0
      },
      {
        name: '辣条',
        inputPrice: 2,
        outPrice: 3,
        icon: require('../assets/gameStore/辣条.png'),
        amount: 0
      }
    ])

    let store = ref({
      name: "测试",
      money: 5000,
      level: 1,
      exp: 0,
      expGoal: 100,
      guest: 0,
      location: location.value[0],
      goodsAmount: 0,
      shelves: [],
      achieve: [
        {
          name: '开荒者',
          description: '建造第一块地块',
          ext: 50,
          finish: false
        },
        {
          name: '小试牛刀',
          description: '建造第一个货架',
          ext: 50,
          finish: false
        },
        {
          name: '买！',
          description: '购买第一份商品',
          ext: 50,
          finish: false
        },
      ]
    })

    const selectLocation = (i) => {
      store.value.location = location.value[i]
      store.value.money -= location.value[i].rentMoney
      stage.value.location = false
      stage.value.giveName = true
    }

    const purchase = (currentValue, oldValue, item) => {
      // console.log(store.value.shelves.length * 40);
      // console.log(store.value.shelves.length * 40 - store.value.goodsAmount)
      store.value.money -= item.inputPrice * (currentValue - oldValue)
      store.value.goodsAmount += currentValue - oldValue
      for (let i = 0; i < store.value.shelves.length; i++) {
        store.value.shelves[i].full = false
      }
      for (let i = 0; i < Math.ceil(store.value.goodsAmount / 40); i++) {
        store.value.shelves[i].full = true
      }
    }

    const start = () => {
      stage.value.start = false
      stage.value.location = true
      stage.value.state = true
    }

    watch(store.value, (newValue, oldValue) => {
      if (newValue.shelves.length > 0 && !store.value.achieve[1].finish) {
        store.value.achieve[1].finish = true
        store.value.exp += store.value.achieve[1].ext
        ElNotification({
          title: '成就达成！', message: store.value.achieve[1].name, type: 'success', position: 'top-left',
        })
      }
      if (newValue.goodsAmount > 0 && !store.value.achieve[2].finish) {
        store.value.achieve[2].finish = true
        store.value.exp += store.value.achieve[2].ext
        ElNotification({
          title: '成就达成！', message: store.value.achieve[2].name, type: 'success', position: 'top-left',
        })
      }
    })

    return {
      stage,
      start,
      goodsData,
      store,
      location,
      selectLocation,
      purchase,
    }
  }
}
</script>

<style scoped>
.body {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
}

.buttonNormal {
  height: 50px;
  font-size: 20px;
  margin-top: 10px;
}

.main {
  position: absolute;
  top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.tip {
  font-size: 20px;
  font-weight: bold;
  position: absolute;
  top: 20px;
}

.menuButton {
  height: 60px;
  width: 100px;
  border-width: 3px 3px 3px 0;
  border-style: solid;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
}

.menuButton:hover {
  cursor: pointer;
  background-color: darkseagreen;
}

.goodsPurchase {
  display: flex;
  align-items: center;
  font-size: 20px;
}

.buildingItem {
  display: flex;
  align-items: center;
  user-select: none;
}

.buildingItem:hover {
  cursor: pointer;
  background-color: darkseagreen;
}

.achieveItem {
  display: flex;
  align-items: center;
  user-select: none;
}

.shelfImg {
  margin-left: 75px;
}
</style>