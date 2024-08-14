export class CapeModel {
    public name: string;
    public id: string;
    public texture: string;
  }
  export class MinecraftIntegrationModel {
    public id: string;
    public username: string;
    public currentCapeId: string;
    public capes: CapeModel[];
  }
  