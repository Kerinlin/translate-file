<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less" scoped>
#app {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background-image: url("./assets/bg1.png");
  background-size: cover;
  // background-repeat: no-repeat;
  &:hover {
    cursor: url("./assets/defaultcur.png"), default;
  }
}
</style>
