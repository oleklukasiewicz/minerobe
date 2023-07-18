<script lang="ts">
    export let imageUrl;
    
    const downloadImage = () => {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  </script>
  
  <div>
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <img src={imageUrl} alt="Downloadable image" />
    <button on:click={downloadImage}>Download</button>
  </div>