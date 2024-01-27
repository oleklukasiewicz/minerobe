<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
</script>

<h1 id="view-title">Explore new outfits</h1>
<Button label="Button" />
<Button label="Button" size="large" />
<Button label="Button" size="small" />
<br />
<Button label="Button" type="secondary" />
<Button label="Button" type="secondary" size="large" />
<Button label="Button" type="secondary" size="small" />
<br />
<Button label="Button" type="tertiary" />
<Button label="Button" type="tertiary" size="large" />
<Button label="Button" type="tertiary" size="small" />
<br />
<Button label="Button" icon={DownloadIcon} />
<Button label="Button" icon={DownloadIcon} size="large"/>
<Button label="Button" icon={DownloadIcon} size="small"/>
<br />
<Button label="Button" icon={DownloadIcon} type="secondary" />
<Button label="Button" icon={DownloadIcon} type="secondary" size="large"/>
<Button label="Button" icon={DownloadIcon} type="secondary" size="small"/>
<br />
<Button label="Button" icon={DownloadIcon} onlyIcon />
<Button label="Button" icon={DownloadIcon} onlyIcon size="large"/>
<Button label="Button" icon={DownloadIcon} onlyIcon size="small"/>
<br />
<Button label="Button" icon={DownloadIcon} onlyIcon type="secondary" />
<Button label="Button" icon={DownloadIcon} onlyIcon type="secondary" size="large"/>
<Button label="Button" icon={DownloadIcon} onlyIcon type="secondary" size="small"/>
<br />
<Button label="Button" icon={DownloadIcon} onlyIcon type="tertiary"/>
<Button label="Button" icon={DownloadIcon} onlyIcon type="tertiary" size="large"/>
<Button label="Button" icon={DownloadIcon} onlyIcon type="tertiary" size="small"/>
<style lang="scss">
  @import "style.scss";
</style>
