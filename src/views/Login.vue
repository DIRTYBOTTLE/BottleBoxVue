<template>

  <div class="body" :style="setBackground()">
    <div class="container">
      <img :src="setImg()">
      <div class="panel">
        <div class="content login">
          <div class="switch">
            <span :class='{"active": active === "login"}' @click='go("login")'>登陆</span>
            <span>/</span>
            <span :class='{"active": active === "register"}' @click='go("register")'>注册</span>
          </div>
          <div class="form" id="fromLogin">
            <!--注册-->
            <template v-if='active==="register"'>
              <div class="input"><input :class='{ hasValue: registerForm.email }' v-model='registerForm.email'
                                        type="text" name="email" id='email'/><label for="email">邮箱</label></div>
              <div class="input"><input :class='{ hasValue: registerForm.Username }' v-model='registerForm.name'
                                        type="text" name="Username" id="username"/><label for="username">用户名</label>
              </div>
              <div class="input"><input :class='{ hasValue: registerForm.Password }' v-model='registerForm.password'
                                        type="password" name="Password" id="password"/><label
                  for="password">密码</label>
              </div>
              <div class="input"><input :class='{ hasValue: registerForm.repeat }' v-model='registerForm.repeat'
                                        type="password" name="repeat" id="Passwordrepeat"/><label
                  for="Passwordrepeat">确认密码</label>
              </div>
              <button type="submit" @click='register'>注册</button>
            </template>
            <!--登陆-->
            <template v-if='active === "login"'>
              <div class="input"><input :class='{ hasValue: loginForm.Username }' v-model='loginForm.name'
                                        type="text" name="Username" id="username"/><label for="username">用户名</label>
              </div>
              <div class="input"><input :class='{ hasValue: loginForm.Password }' v-model='loginForm.password'
                                        type="password" name="Password" id="Password"/><label
                  for="Password">密码</label>
              </div>
              <span>忘记?</span>
              <button type="submit" @click='login'>登陆</button>
            </template>
            <br/><br/>
          </div>
        </div>
      </div>
      <div v-loading="true" v-html="lyric" id="lyric"
           style="width: 29%;position: absolute;right: 0;bottom: 40px;
           display: flex;justify-content: center;text-align: center">
      </div>
    </div>

  </div>

</template>

<script>
import axios from 'axios'
import request from "@/utils/request";

export default {
  name: "Music",
  data() {
    return {
      active: 'login',
      registerForm: {email: '', name: '', password: '', repeat: '',},
      loginForm: {name: '', password: '',},
      lyric: '',
      bgUrl: [{bg: require('../assets/bg1.png'), bgOri: require('../assets/bg1ori.jpg')},
        {bg: require('../assets/bg2.png'), bgOri: require('../assets/bg2ori.jpg')},
        {bg: require('../assets/bg3.png'), bgOri: require('../assets/bg3ori.jpg')}
      ],
      bgNum: 0,
    }
  },
  methods: {
    register() {
      if (this.registerForm.password !== this.registerForm.repeat) {
        this.$message({type: "error", message: "两次密码输入不一致！"});
        return;
      }
      request.post('/api/user/registerUser.do', this.registerForm);
      this.go("login")
      this.$message({type: "success", message: "注册成功"});
    },
    login() {
      request.post('/api/user/login.do', this.loginForm).then(res => {
        if (res.data.code === '0') {
          this.$message({
            type: "success",
            message: "登陆成功！"
          })
          sessionStorage.setItem("user", JSON.stringify(res.data.data));
          this.$router.push("/home")
        } else {
          this.$message({
            type: "error",
            message: "用户名或密码错误！"
          })
        }
      })
    },
    randomMusic() {
      axios.get('https://v1.hitokoto.cn/?c=c&c=d&c=e&c=f&c=g&c=h&c=i&c=j&c=k&c=l').then(res => {
        this.lyric = res.data.hitokoto;
      })
    },
    go(type) {
      this.active = type;
    },
    setBackground() {
      return {backgroundImage: 'url(' + this.bgUrl[this.bgNum].bgOri + ')'}
    },
    randomNum(minNum, maxNum) {
      switch (arguments.length) {
        case 1:
          return parseInt(Math.random() * minNum + 1, 10);
        case 2:
          return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
          return 0;
      }
    },
    setImg() {
      return this.bgUrl[this.bgNum].bg
    }
  },
  created() {
    this.randomMusic();
    this.bgNum = this.randomNum(0, this.bgUrl.length - 1);
  },

}
</script>

<style scoped>

.body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  position: relative;
  width: 70rem;
}

.container img {
  width: 70rem;
}

.panel {
  width: 30%;
  margin: 7rem 0 0;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  justify-content: center;
}

.switch span {
  color: #ccc;
  font-size: 1.4rem;
  cursor: pointer;
}

.switch span.active {
  color: rgb(181, 154, 254);
}

.form {
  width: 12rem;
  margin: 3rem 0 0;
  /*background-color: darkseagreen;*/
  height: 30%;
  /*height: 30%;*/
}

.form .input {
  position: relative;
  opacity: 1;
  height: 2rem;
  width: 100%;
  margin: 2rem 0;
  transition: .4s;
  /*background-color: #941818;*/
}

.input input {
  outline: none;
  width: 100%;
  border: none;
  border-bottom: .1rem solid rgb(181, 154, 254);
  position: relative;
  line-height: 35px;
  background: transparent !important;
  /*background: transparent;*/
  z-index: 1;
  /*box-shadow: inset 0 0 0 1000px rgba(181, 154, 254,0%) !important;*/

}

input:-internal-autofill-previewed, input:-internal-autofill-selected {
  -webkit-text-fill-color: #807c7c;
  transition: background-color 5000s ease-out 0.5s;
}

.input label {
  position: absolute;
  left: 0;
  /*top: 20%;*/
  /*font-size: 1.2rem;*/
  top: -50%;
  font-size: .9rem;
  color: rgb(129, 101, 207);
  transition: .3s;

}

.form span {
  display: block;
  color: rgb(110, 89, 167);
  font-size: .8rem;
  cursor: pointer;
}

.form button {
  border: none;
  outline: none;
  margin: 2.5rem 0 0;
  width: 100%;
  height: 3rem;
  border-radius: 3rem;
  background: linear-gradient(90deg, rgb(181, 154, 254), rgb(245, 189, 253));
  box-shadow: 0 0 8px rgb(181, 154, 254);
  cursor: pointer;
  color: white;
  font-family: miaowu;
}

#lyric {
}
</style>