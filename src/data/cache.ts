import {writable, type Writable } from "svelte/store";
import {OutfitPackage } from "./common";

export let itemPackage:Writable<OutfitPackage> = writable(new OutfitPackage("New Skin","alex",[]));