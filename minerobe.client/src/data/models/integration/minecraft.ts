import type { MODEL_TYPE } from "$src/data/enums/model";

export class Cape {
  public name: string;
  public id: string;
  public texture: string;
}
export class MinecraftAccount {
  public id: string;
  public username: string;
  public currentCapeId: string;
  public capes: Cape[];
  public reLinkRequired: boolean;
}
export class MinecraftSkin {
  public id: string;
  public texture: string;
  public name: string;
  public model: MODEL_TYPE;
}
