import { get, writable, type Writable } from "svelte/store";
import type { OutfitLayer } from "./common";
import { _ } from "svelte-i18n";

export   let itemLayers: Writable<OutfitLayer[]> = writable([]);
export let itemModelType: Writable<string> = writable("alex"); 
export let itemName: Writable<string> = writable("New Skin"); 