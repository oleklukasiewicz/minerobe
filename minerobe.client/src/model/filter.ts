import { PACKAGE_TYPE } from "$src/data/consts/data";

export class OutfitFilter
{
    type:string;
    outfitType:string[]
    colors:string[]
    isShared:boolean
    phrase:string
    constructor()
    {
        this.type = PACKAGE_TYPE.OUTFIT;
        this.outfitType = [];
        this.colors = [];
        this.isShared = null;
        this.phrase
    }
}