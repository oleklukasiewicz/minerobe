import NewOutfitBottomAnimation from "$src/animation/bottom";
import NewOutfitBottomAltAnimation from "$src/animation/bottomAlt";
import NewOutfitBottomAlt2Animation from "$src/animation/bottomAlt2";
import ClapAnimation from "$src/animation/clap";
import DefaultAnimation from "$src/animation/default";
import HandsUpAnimation from "$src/animation/handsup";
import HatAnimation from "$src/animation/hat";
import WavingAnimation from "$src/animation/waving";
import type { RenderAnimation } from "$src/data/animation";
import type { OutfitPackage } from "$src/data/common";
import { CHANGE_TYPE, OUTFIT_TYPE } from "$src/data/consts";
import * as THREE from "three";

export const GetAnimationForPackageChange = function (
  itempackage: OutfitPackage,
  type: string,
  index: number
): RenderAnimation[] {
  if (type == CHANGE_TYPE.MODEL_TYPE_CHANGE) {
    return [];
  }
  if (type == CHANGE_TYPE.LAYER_ADD) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_DOWN) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_UP) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
      DefaultAnimation,
    ];
  }
  if (type == CHANGE_TYPE.LAYER_REMOVE) {
    return [
      GetAnimationForType(itempackage.layers[index][itempackage.model].type),
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
      if (random < 0.0) {
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
export const CreateModelAnimationData = function (scene) {
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
    new THREE.Vector3(-0.31, -0.125, 0)
  );
  data.leftArmPivot = la.pivot;

  const ra = CreatePivotPart(
    data.body,
    data.rightarm,
    new THREE.Vector3(0.31, -0.125, 0)
  );
  data.rightArmPivot = ra.pivot;

  const ll = CreatePivotPart(
    data.body,
    data.leftleg,
    new THREE.Vector3(-0.125, -0.75, 0),
    new THREE.Vector3(0, 0, 0)
  );
  data.leftLegPivot = ll.pivot;

  const rl = CreatePivotPart(
    data.body,
    data.rightleg,
    new THREE.Vector3(0.125, -0.75, 0),
    new THREE.Vector3(0, 0, 0)
  );
  data.rightLegPivot = rl.pivot;

  const h = CreatePivotPart(data.body, data.head, new THREE.Vector3(0, 0, 0));
  data.headPivot = h.pivot;

  data.bodyPivot = data.body;

  return data;
};
export const RemoveModelAnimationData = function (data) {
  let basePart = data.bodyPivot;
  basePart.add(data.leftArmPivot.children[0]);
  basePart.add(data.rightArmPivot.children[0]);
  basePart.add(data.leftLegPivot.children[0]);
  basePart.add(data.rightLegPivot.children[0]);
  basePart.add(data.headPivot.children[0]);

  // Usuń pivoty
  basePart.remove(data.leftArmPivot);
  basePart.remove(data.rightArmPivot);
  basePart.remove(data.leftLegPivot);
  basePart.remove(data.rightLegPivot);
  basePart.remove(data.headPivot);
  // reset positions
  data.leftleg.position.x = -0.125;
  data.leftleg.position.y = -0.75;
  data.leftleg.position.z = 0;
 
  data.rightleg.position.x = 0.125;
  data.rightleg.position.y = -0.75;
  data.rightleg.position.z = 0;
};
