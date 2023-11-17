import type { OutfitPackage } from "./common";

export class WardrobePackage
{
    id: string;
    outfits:OutfitPackage[];
    constructor(id:string,outfits:OutfitPackage[])
    {
        this.id = id;
        this.outfits = outfits;
    }
}