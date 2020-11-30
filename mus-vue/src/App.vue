<template>
  <div id="app">
    <RecursiveListVue
      v-bind="{
        list: musDirStructure,
        relativePath: '',
        musConfigs: allData.backData.musConfigs,
      }"
      @song-click="(songPath) => emitSongPath(songPath)"
    />
    <div>
      <div v-for="(item, index) in execHist" :key="index">{{ item }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RecursiveListVue from './components/Recursive-List.vue';
import { allData } from './data/all.data';
import { socketLib } from './socket.lib';
// import HelloWorld from './components/HelloWorld.vue';

export default Vue.extend({
  name: 'App',
  components: { RecursiveListVue },
  data() {
    return {
      allData: allData,
      execHist: []
    }
  },
  computed: {
    musDirStructure() {
      return allData.backState.musDirStructure
    }
  },
  methods: {
    log(a: any) {
      console.log(a)
    },
    emitSongPath(songPath: string) {
      socketLib.emitEvent('PLAY_SONG', songPath)
    }
  },
  // components: {
  //   HelloWorld,
  // },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
}
</style>
