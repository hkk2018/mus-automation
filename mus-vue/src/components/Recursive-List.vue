<template>
  <div class="list">
    <div v-for="(listKey, index) in Object.keys(list)" :key="index">
      <div class="entry">
        <div class="entryName" @click="clickEntry(listKey)">{{ listKey }}</div>
        <div>
          <input
            v-if="!list[listKey] && getSongConfig(listKey)"
            type="number"
            v-model.number="getSongConfig(listKey).speed"
            @change="(event)=>onSpeedChange(event.target)"
          />
        </div>
      </div>
      <div
        v-if="
          list[listKey] &&
          getFolderState(listKey) &&
          !getFolderState(listKey).isFolded
        "
      >
        <RecursiveList
          v-bind="{
            list: list[listKey],
            relativePath: '\\' + listKey,
            musConfigs: musConfigs,
          }"
          @song-click="onSongClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { socketLib } from '@/socket.lib';
import Vue from 'vue';
import { Prop } from 'vue/types/options';

// recursive example: https://medium.com/@paulyang1234/%E4%BD%BF%E7%94%A8-vue-recursive-component-%E5%AF%A6%E7%8F%BE%E6%A8%B9%E7%8B%80%E8%8F%9C%E5%96%AE-f1128e566cba

interface FolderState {
  folderName: string;
  isFolded: boolean
}

export default Vue.extend({
  name: 'RecursiveList',
  props: {
    list: Object,
    number: Number,
    relativePath: String,
    musConfigs: Array as Prop<{ name: string, speed: number }[]>,
  },
  mounted() {
  },
  data() {
    return {
      folderStates: Object.keys(this.list).filter(key => this.list[key]).map(key => ({ folderName: key, isFolded: true })) as FolderState[],
    }
  },
  methods: {
    log(a: any) { console.log(a) },
    getSongConfig(songName: string) {
      return this.musConfigs.find(config => config.name === songName)
    },
    getFolderState(listKey: string) {
      return this.folderStates.find(fs => fs.folderName === listKey)
    },
    clickEntry(listKey: string) {
      if (this.list[listKey]) {
        let fs = this.getFolderState(listKey);
        if (fs) fs.isFolded = !fs.isFolded;
      }
      else {
        console.log(listKey+'　　　'+new Date().toLocaleTimeString());
        this.$emit('song-click', this.relativePath + '\\' + listKey)
      }
    },
    onSongClick(songPath: string) {
      this.$emit('song-click', songPath);
    },
    onSpeedChange(e:HTMLInputElement){
    //  console.log( e.value)
    //  console.log(typeof e.value) // string...
    //  console.log(this)
    socketLib.emitEvent('SAVE_SONG_CONFIGS',this.musConfigs)
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.list {
  margin-left: 2rem;
  .entry {
    cursor: pointer;
    display: flex;
    // transition: 0.05s;
    .entryName {
      width: 30rem;
    }
    input {
      width: 4rem;
      margin-left: 2rem;
      text-align: center;
    }
  }
  .entry:hover {
    background-color: goldenrod;
  }
}
</style>
