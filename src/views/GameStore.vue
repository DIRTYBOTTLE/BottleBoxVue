<template>
  <div class="body">
    <!--  开始页面  -->
    <template v-if="!started">
      商店模拟器
      <el-button @click="start">开始</el-button>
    </template>
    <template v-if="started">
      <div>
        <el-table :data="goodsData" style="width: 100%">
          <el-table-column prop="goods" label="商品" width="180"/>
          <el-table-column prop="price" label="进价" width="180"/>
          <el-table-column prop="sale" label="售价" width="180"/>
          <el-table-column label="数量">
            <template #default="scope">
<!--              <el-button size="small" @click="handleEdit(scope.$index, scope.row)"-->
<!--              >Edit</el-button-->
<!--              >-->
              <el-input-number v-model="num" :min="1" :max="10" @change="handleChange" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: "GameStore",
  setup() {
    let started = ref(false);

    const start = () => {
      started.value = true;
    }

    const goodsData = ref([
      {
        goods: '麻辣公主辣条-小',
        price: '1.5',
        sale: '2'
      },
      {
        goods: '麻辣公主辣条-大',
        price: '3.5',
        sale: '4'
      },
      {
        goods: '味浓面筋-小',
        price: '2',
        sale: '3'
      },
      {
        goods: '味浓面筋-大',
        price: '4',
        sale: '5'
      },
      {
        goods: '三只蚂蚁-草莓干',
        price: '14',
        sale: '17'
      },
      {
        goods: '三只蚂蚁-碧根果',
        price: '16',
        sale: '19'
      },
      {
        goods: '千草味-山楂片',
        price: '16',
        sale: '20'
      },
      {
        goods: '千草味-白桃干',
        price: '18',
        sale: '22'
      },
      {
        goods: '光朋-鲜奶',
        price: '3',
        sale: '4.5'
      },
      {
        goods: '光朋-酸奶',
        price: '4',
        sale: '6'
      },
      {
        goods: '猛牛-鲜奶',
        price: '2',
        sale: '3'
      },
      {
        goods: '猛牛-酸奶',
        price: '3',
        sale: '4.5'
      },


    ])

    return {
      started,
      start,
      goodsData
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
</style>