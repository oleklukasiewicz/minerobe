import {
  RenderAnimation,
  lerp,
  lerpOutCubic,
  isPoseReady,
} from "$data/animation";
import { MODEL_TYPE } from "$data/consts";
const NewOutfitBottomAlt2Animation = new RenderAnimation(
  function (scene, keepData = false, modelName) {
    let data: any = {
      head: scene.getObjectByName("Head"),
      body: scene.getObjectByName("Body"),
      leftarm: scene.getObjectByName("LeftArm"),
      rightarm: scene.getObjectByName("RightArm"),
      leftleg: scene.getObjectByName("LeftLeg"),
      rightleg: scene.getObjectByName("RightLeg"),
    };
    data.head.parent.remove(data.head);

    data.body.add(data.head);
    data.head.position.set(0, 0, 0);

    data.leftarm.parent.remove(data.leftarm);
    data.rightarm.parent.remove(data.rightarm);

    data.body.add(data.leftarm);
    data.body.add(data.rightarm);

    const armDistanceX = 0.31; // Adjust this value to change the distance of the arms from the body in the x direction
    const armDistanceZ = 0.0; // Adjust this value to change the distance of
    // Set the position of the arms relative to the body
    if (modelName == MODEL_TYPE.STEVE) {
      data.leftarm.position.set(-armDistanceX, -0.12, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.12, armDistanceZ);
    } else {
      data.leftarm.position.set(-armDistanceX, -0.15, -armDistanceZ);
      data.rightarm.position.set(armDistanceX, -0.15, armDistanceZ);
    }

    if (keepData) {
      return data;
    } else {
      data.isRotatingDown = true;
      data.downRotation = -30 * (Math.PI / 180);
      data.bodyDownRotation = 10 * (Math.PI / 180);
      data.isLookingLeft = false;
      data.isLookingRight = false;
      data.leftRotation = 30 * (Math.PI / 180);
      data.rightRotation = -30 * (Math.PI / 180);
      data.armRot = (Math.random() * 10 + 5) * (Math.PI / 180);
      data.speed = 1;
      data.angle = 0;
      data.returnSpeed = 0.01;
    }
    return data;
  },
  function () {
    return true;
  },
  function (data, scene, clock, modelName, elapsedRenderTime) {
    const resetSpeed = 0.02; // Adjust this value to change the speed of the reset
    const epsilon = 0.01; // Adjust this value to change the precision of the equality check
    const amplitude = 0.025;
    const elapsedTime = clock;

    const cSin = 1 * Math.sin(clock);
    if (data.head) {
    
      if (data.isRotatingDown) {
        data.isLookingLeft = true;
        // Interpolate between the current rotation and the down rotation
        data.head.rotation.x = lerpOutCubic(
          clock,
          data.head.rotation.x,
          data.downRotation,
          resetSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(
          clock,
          data.leftarm.rotation.z,
          data.armRot * -1,
          resetSpeed
        );

        data.rightarm.rotation.z = lerpOutCubic(
          clock,
          data.rightarm.rotation.z,
          data.armRot,
          resetSpeed
        );

        // If the head is close enough to the down rotation, set the rotation to the down rotation
        if (Math.abs(data.head.rotation.x - data.downRotation) < epsilon) {
          data.head.rotation.x = data.downRotation;
          data.isRotatingDown = false;
        }
      }
      if (data.isLookingLeft) {
        // Interpolate between the current rotation and the left rotation
        data.head.rotation.y = lerpOutCubic(
          clock,
          data.head.rotation.y,
          data.rightRotation,
          resetSpeed
        );
        data.rightleg.rotation.x = lerpOutCubic(
          clock,
          data.rightleg.rotation.x,
          0.7,
          resetSpeed
        );
        data.rightleg.rotation.y = lerpOutCubic(
          clock,
          data.rightleg.rotation.y,
          data.leftRotation,
          resetSpeed
        );
        // If the head is close enough to the left rotation, set the rotation to the left rotation
        if (Math.abs(data.head.rotation.y - data.rightRotation) < epsilon) {
          data.head.rotation.y = data.rightRotation;
          data.isLookingLeft = false;
          data.isLookingRight = true;
        }
      } else if (data.isLookingRight) {
        // Interpolate between the current rotation and the right rotation
        data.rightleg.rotation.y = lerpOutCubic(
          clock,
          data.rightleg.rotation.y,
          data.leftRotation*-1,
          resetSpeed
        );
        // If the head is close enough to the right rotation, set the rotation to the right rotation
        if (Math.abs(data.rightleg.rotation.y - (data.leftRotation*-1)) < epsilon) {
          data.rightleg.rotation.y = data.leftRotation*-1;
          data.isLookingRight = false;
        }
      } else {
        // Interpolate between the current rotation and 0
        data.head.rotation.x = lerpOutCubic(
          clock,
          data.head.rotation.x,
          0,
          resetSpeed
        );
        data.body.rotation.z = lerpOutCubic(
          clock,
          data.body.rotation.z,
          0,
          resetSpeed
        );
        data.head.rotation.z = lerpOutCubic(
          clock,
          data.head.rotation.z,
          0,
          resetSpeed
        );
        data.head.rotation.y = lerpOutCubic(
          clock,
          data.head.rotation.y,
          0,
          resetSpeed
        );
        data.leftarm.rotation.z = lerpOutCubic(
          clock,
          data.leftarm.rotation.z,
          0,
          resetSpeed
        );
        data.rightleg.rotation.x = lerpOutCubic(
          clock,
          data.rightleg.rotation.x,
          -0.1,
          resetSpeed
        );
        data.rightleg.rotation.y = lerpOutCubic(
          clock,
          data.rightleg.rotation.y,
          0,
          resetSpeed
        );
        data.rightarm.rotation.z = lerpOutCubic(
          clock,
          data.rightarm.rotation.z,
          0,
          resetSpeed
        );

        data.body.position.y = lerpOutCubic(
          clock,
          data.body.position.y,
          1.47,
          resetSpeed
        );
        // If the head is close enough to 0, set the rotation to 0
        if (
          isPoseReady([
            { value: data.head.rotation.x, target: 0 },
            { value: data.body.rotation.z, target: 0 },
            { value: data.head.rotation.y, target: 0 },
            { value: data.head.rotation.z, target: 0 },
            { value: data.rightleg.rotation.y, target: 0 },
            { value: data.rightleg.rotation.x, target: -0.1 },
            { value: data.rightarm.rotation.z, target: 0 },
          ])
        ) {
          return true;
        }
        return false;
      }
    }
  }
);
export default NewOutfitBottomAlt2Animation;
