import * as THREE from 'three'
 export default {
    positionStyle    : Type.CUBE,
    positionBase     : new THREE.Vector3( 0, 200, 0 ),
    positionSpread   : new THREE.Vector3( 400, 0, 400 ),

    velocityStyle    : Type.CUBE,
    velocityBase     : new THREE.Vector3( 50, -200, 0 ),
    velocitySpread   : new THREE.Vector3( 50, 200, 50 ),
    accelerationBase : new THREE.Vector3( 0, -10,0 ),

    angleBase               : 0,
    angleSpread             : 720,
    angleVelocityBase       :  0,
    angleVelocitySpread     : 60,

    particleTexture : textureLoader.load('./snow2.png' ),

    sizeTween    : new Tween( [0, 0.25], [4, 5] ),
    colorBase   : new THREE.Vector3(0.66, 1.0, 0.9), // H,S,L
    opacityTween : new Tween( [2, 3], [0.8, 0] ),

    particlesPerSecond : 500,
    particleDeathAge   : 1.0,
    emitterDeathAge    : 60
  }