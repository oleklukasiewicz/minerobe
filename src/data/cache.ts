import { writable, type Writable } from "svelte/store";
import type { OutfitLayer } from "./common";

export   let itemLayers: Writable<OutfitLayer[]> = writable([]);