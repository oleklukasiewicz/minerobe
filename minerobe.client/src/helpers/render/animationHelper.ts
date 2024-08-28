import NewOutfitBottomAnimation from "$src/animation/bottom";
import NewOutfitBottomAltAnimation from "$src/animation/bottomAlt";
import NewOutfitBottomAlt2Animation from "$src/animation/bottomAlt2";
import ClapAnimation from "$src/animation/clap";
import DefaultAnimation from "$src/animation/default";
import HandsUpAnimation from "$src/animation/handsup";
import HatAnimation from "$src/animation/hat";
import WavingAnimation from "$src/animation/waving";
import {
  isNextStepReady,
  lerpOutCubic,
  type RenderAnimation,
} from "$src/data/animation";
import { CHANGE_TYPE, MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
import type { OutfitPackage } from "$src/model/package";
import * as THREE from "three";
const CreatePropertyStep = function (
  data,
  part,
  property: "position" | "rotation",
  value: "x" | "y" | "z",
  targetValue,
  duration,
  ease: "direct" | "ease" = "ease",
  clock
) {
  if (ease == "ease") {
    data[part][property][value] = lerpOutCubic(
      clock,
      data[part][property][value],
      targetValue,
      duration
    );
  } else {
    data[part][property][value] = targetValue;
  }
};

export class AnimationPropertyStep {
  part: string;
  property: "position" | "rotation";
  value: "x" | "y" | "z";
  targetValue: number;
  duration: number;
  ease: "direct" | "ease" = "ease";
  constructor(
    part,
    property: "position" | "rotation",
    value: "x" | "y" | "z",
    targetValue,
    duration,
    ease: "direct" | "ease" = "ease"
  ) {
    this.part = part;
    this.property = property;
    this.value = value;
    this.targetValue = targetValue;
    this.duration = duration;
    this.ease = ease;
  }
}
export class AnimationStepState {
  name: string;
  step: AnimationPropertyStep[];
  onFinished: any;
  epsilon = 0.003;
  constructor(name, step, onFinishedMth, epsilon = 0.003) {
    this.name = name;
    this.step = step;
    this.onFinished = onFinishedMth;
    this.epsilon = epsilon;
  }
}

export const GetAnimationForPackageChange = function (
  itempackage: OutfitPackage,
  type: string,
  index: number
): RenderAnimation[] {
  if (type == CHANGE_TYPE.MODEL_TYPE_CHANGE) {
    return [NewOutfitBottomAnimation, DefaultAnimation];
  }
  if (type == CHANGE_TYPE.LAYER_ADD) {
    return [
      GetAnimationForType(itempackage.layers[index].outfitType),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_DOWN) {
    return [
      GetAnimationForType(itempackage.layers[index].outfitType),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_UP) {
    return [
      GetAnimationForType(itempackage.layers[index].outfitType),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_REMOVE) {
    return [
      GetAnimationForType(itempackage.layers[index].outfitType),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.PACKAGE_IMPORT) {
    const random = Math.random();

    if (random < 0.2) {
      return [HandsUpAnimation];
    } else {
      if (random < 0.4) return [WavingAnimation];
      else [ClapAnimation];
    }
    [DefaultAnimation];
  }
  if (type == CHANGE_TYPE.SHARE) {
    return [WavingAnimation, DefaultAnimation];
  }
  if (type == CHANGE_TYPE.DOWNLOAD) {
    return [HandsUpAnimation, DefaultAnimation];
  }
  if (type == CHANGE_TYPE.SKIN_SET) {
    return [ClapAnimation, DefaultAnimation];
  }
  return [];
};
export const GetAnimationForType = function (type: string) {
  const random = Math.random();
  switch (type) {
    case OUTFIT_TYPE.HAT:
      return HatAnimation;
    case OUTFIT_TYPE.TOP:
    case OUTFIT_TYPE.HOODIE:
      return NewOutfitBottomAnimation;
    case OUTFIT_TYPE.SHOES:
      if (random < 0.5) {
        return NewOutfitBottomAlt2Animation;
      } else {
        return WavingAnimation;
      }
    case OUTFIT_TYPE.BOTTOM:
      if (random < 0.5) {
        return NewOutfitBottomAlt2Animation;
      } else {
        return NewOutfitBottomAltAnimation;
      }
  }
};
export const CreatePivotPart = function (
  basePart,
  targetPart,
  pivotPosition: THREE.vector3,
  partPosition: THREE.vector3 = new THREE.Vector3(0, 0, 0),
  showAxis = false
) {
  targetPart.parent.remove(targetPart);
  basePart.add(targetPart);
  targetPart.position.set(partPosition.x, partPosition.y, partPosition.z);

  let pivot = new THREE.Object3D();
  pivot.position.y = pivotPosition.y;
  pivot.position.x = pivotPosition.x;
  pivot.position.z = pivotPosition.z;
  pivot.add(targetPart);
  basePart.add(pivot);

  if (showAxis) {
    const axisHelper = new THREE.AxesHelper(5);
    pivot.add(axisHelper);
  }

  return { part: targetPart, pivot: pivot };
};
export const CreateModelAnimationData = function (
  scene,
  modelName,
  debug = false
) {
  const data = {
    body: scene.getObjectByName("Body"),
    head: scene.getObjectByName("Head"),
    leftarm: scene.getObjectByName("LeftArm"),
    rightarm: scene.getObjectByName("RightArm"),
    leftleg: scene.getObjectByName("LeftLeg"),
    rightleg: scene.getObjectByName("RightLeg"),
    leftArmPivot: null,
    rightArmPivot: null,
    leftLegPivot: null,
    rightLegPivot: null,
    headPivot: null,
    bodyPivot: null,
  };
  const la = CreatePivotPart(
    data.body,
    data.leftarm,
    modelName == MODEL_TYPE.STEVE
      ? new THREE.Vector3(-0.31, -0.125, 0)
      : new THREE.Vector3(-0.31, -0.16, 0),
    undefined,
    debug
  );
  data.leftArmPivot = la.pivot;

  const ra = CreatePivotPart(
    data.body,
    data.rightarm,
    modelName == MODEL_TYPE.STEVE
      ? new THREE.Vector3(0.31, -0.125, 0)
      : new THREE.Vector3(0.31, -0.16, 0),
    undefined,
    debug
  );
  data.rightArmPivot = ra.pivot;

  const ll = CreatePivotPart(
    data.body,
    data.leftleg,
    new THREE.Vector3(-0.125, -0.75, 0),
    new THREE.Vector3(0, 0, 0),
    debug
  );
  data.leftLegPivot = ll.pivot;

  const rl = CreatePivotPart(
    data.body,
    data.rightleg,
    new THREE.Vector3(0.125, -0.75, 0),
    new THREE.Vector3(0, 0, 0),
    debug
  );
  data.rightLegPivot = rl.pivot;

  const h = CreatePivotPart(data.body, data.head, new THREE.Vector3(0, 0, 0));
  data.headPivot = h.pivot;

  data.bodyPivot = data.body;

  return data;
};
export const AnimationStep = function (
  data,
  props: AnimationPropertyStep[],
  clock,
  epsilon = 0.003
) {
  props.forEach((prop) => {
    CreatePropertyStep(
      data,
      prop.part,
      prop.property,
      prop.value,
      prop.targetValue,
      prop.duration,
      prop.ease,
      clock
    );
  });
  if (
    isNextStepReady(
      props.map((prop) => {
        return {
          value: data[prop.part][prop.property][prop.value],
          target: prop.targetValue,
        };
      }),
      epsilon
    )
  ) {
    return true;
  }
  return false;
};
export const AnimationStepManager = function (data, steps, startState) {
  let findStep = (name) => steps.find((step) => step.name == name);
  let currentStep = findStep(startState);
  return {
    currentStep: currentStep,
    run: (clock) => {
      if (AnimationStep(data, currentStep.step, clock, currentStep.epsilon)) {
        currentStep = findStep(currentStep.onFinished());
      }
      if (currentStep == undefined) {
        return true;
      }
    },
  };
};
