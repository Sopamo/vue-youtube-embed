<template lang="html">
  <container :title="title">
    <youtube :video-id="videoId" :preview="true"></youtube>
  </container>
</template>

<script>
import container from './container.vue'

export default {
  components: { container },
  data () {
    return {
      title: 'Preview',
      videoId: 'M7lc1UVf-VE'
    }
  }
}
</script>

<style lang="css">
</style>
