export class ModelTextureArea
{
    public constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) { }
}
export class ModelPart
{
    public constructor(
        public name: string,
        public textureArea: ModelTextureArea,
        public outerTextureArea: ModelTextureArea,
    ) { }
}
export class ModelMap
{
    public constructor(
        public name: string,
        public head: ModelPart,
        public body: ModelPart,
        public leftLeg: ModelPart,
        public rightLeg: ModelPart,
        public leftArm: ModelPart,
        public rightArm: ModelPart
    ) { }
}