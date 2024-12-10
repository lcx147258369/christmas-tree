
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {AxesHelper } from 'three/src/helpers/AxesHelper'
import { Noise } from 'noisejs'; // 引入噪声库
// import snow from './public/sprite/snow';
// 创建一个场景
const scene = new THREE.Scene();
// 创建一个相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 500 ) // 75角度， 拍摄面长宽比  近裁剪面， 远裁剪面
// 创建一个渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias : true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; // 可选，增强色彩表现
renderer.toneMappingExposure = 1; // 增加整体亮度
//  控制器
const control = new OrbitControls(camera, renderer.domElement)
// 人物动画定时器
const clock = new THREE.Clock();
let mixer; //人物模型 

//1、创造粒子缓冲区几何体
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 2000;

// 创建音频监听器
const listener = new THREE.AudioListener();
camera.add(listener);
// 创建音频对象
const sound = new THREE.PositionalAudio(listener);


/**
 * 设置场景的背景和位置
 */
function setSceneBackground () {
  let backgroudTexture = new THREE.TextureLoader().load('/public/texture/background/chirsmas_bg2.jpg', (texture) => {
    // texture.image.width = 1000;
    // texture.image.height = 1000;
    // scene.background = texture;
    // camera.updateProjectionMatrix()
    // return texture
   });
  
   const canvasAspect = window.innerWidth / window.innerHeight
  
   const imageAspect = backgroudTexture.image ? backgroudTexture.image.width / backgroudTexture.image.height : 1;
   
   const aspect = imageAspect / canvasAspect;
   
   backgroudTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) : 0;
   
   backgroudTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
   
   backgroudTexture.offset.y = aspect > 1 ? 0 : (1 - aspect);
   
   backgroudTexture.repeat.y = aspect > 1 ? 1 : aspect/2;

   scene.background = backgroudTexture;
}




/**
 * 设置相机位置
 */
function setCamera () {
  camera.position.set(0, 0, 100); //设置相机位置
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
}



/**
 * 设置渲染器参数
 */
function setRendererOption () {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.setSize(window.innerWidth, window.innerHeight);
  let pixelRatio = renderer.getPixelRatio();
  renderer.setPixelRatio(pixelRatio)
}


/**
 * 设置聚光灯
 */
function createSpotLight () {
  // 聚光灯
  var spotLight = new THREE.SpotLight(0xFFFF00, 1, 100);
  spotLight.position.set(0, 0, 0);
  spotLight.isSpotLightShadow = true
  spotLight.castShadow = true
  spotLight.shadow.camera.near = 1;    // default
  spotLight.shadow.camera.far = 1000   // default
  return spotLight;
}




/**
 * 设置环境光
 */
function createAmbientLight () {
  // 环境光
  let ambientlight = new THREE.AmbientLight(0xFFFFFF, 1); // soft white light
  return ambientlight;
}




/**
 * 设置平行光
 */
function createDicLight () {
  // 平行光
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
  directionalLight.position.set(100, 20, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.radius = 1000;
  directionalLight.shadow.mapSize.set(4096, 4096);
  return directionalLight;
}


/**
 * 设置点光源
 */
function createPointLight () {
  // 点光源
  var light = new THREE.PointLight(0xFF00FF, 10, 100);
  light.position.set(50, 120, 50);
  return light;
}



function loadTreeModel () {
  // 加载一个3D圣诞树模型
  const loader = new GLTFLoader().setPath( 'models/tree3/' );
  loader.load('scene.gltf', function (gltf) {
    gltf.scene.scale.set(4, 4, 4)
    gltf.scene.position.set(-30, -1.2, 0)
    gltf.scene.castShadow = true
    scene.add(gltf.scene);
  }, undefined, function (error) {
    console.error(error);
  });
}

function loadShopModel () {
   // 加载一个3D商店模型
   const loader = new GLTFLoader().setPath( 'models/shop/' );
   loader.load('scene.gltf', function (gltf) {
     let modal = gltf.scene;
     gltf.scene.scale.set(15, 15, 15)
     gltf.scene.position.set(40, 0, 0)
     gltf.scene.castShadow = true
     scene.add(gltf.scene);
     modal.add(sound)
   }, undefined, function (error) {
     console.error(error);
   });
}


function createBall () {
  //透明水晶球
  let material = new THREE.MeshPhongMaterial({
  transparent: true,
  opacity: 0.1,
  color: 0xffffff
  });
  let squer = new THREE.SphereGeometry( 20, 100, 100 )
  var Sphere = new THREE.Mesh(squer,material);
  Sphere.position.set(0, 20, 0)
  Sphere.castShadow = true
  //  texture.mapping = THREE.EquirectangularReflectionMapping;
  //  scene.background = texture;
  //  scene.environment = texture;
  return Sphere;
}





/**
 * 雪花
 */
function createSnow () {
  const positions = [];
  const velocities = []; // 用于存储雪花的速度
  //3、随机生成顶点的位置并给粒子缓冲区几何体传值
    for (let i = 0; i < particleCount; i++) {
          positions.push(
            Math.random() * 200 - 100, // x 坐标
            Math.random() * 200,       // y 坐标
            Math.random() * 200 - 100  // z 坐标
          );
         velocities.push(0, -(Math.random() * 0.1 + 0.1), 0); // y 方向速度
    }


  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  const texture = new THREE.TextureLoader().load(`./public/sprite/snow2.png`);  // 载入纹理
  //4、设置点的纹理材质（雪花贴图）
  const pointsMaterial = new THREE.PointsMaterial({size: 1,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    size: 0.5,
    depthTest: false,
    map: texture,
    alphaMap: texture,
    opacity: 0.8
  });
  const pointMesh = new THREE.Points( particlesGeometry, pointsMaterial );
  return pointMesh;

}


function updateSnow () {
 // 更新雪花位置
 const positions = particlesGeometry.attributes.position.array;
 const velocities = particlesGeometry.attributes.velocity.array;
 for (let i = 0; i < particleCount * 3; i += 3) {
  positions[i + 1] += velocities[i + 1]; // 更新 y 坐标

  // 如果雪花落到底部，重置到顶部
  if (positions[i + 1] < -1) {
    positions[i + 1] = 200; // 重置 y 坐标到顶部
    positions[i] = Math.random() * 200 - 100; // 随机 x 坐标
    positions[i + 2] = Math.random() * 200 - 100; // 随机 z 坐标
  }
}
 particlesGeometry.attributes.position.needsUpdate = true;
}

/**
 * 加载雪地
 */
function loadSnowfield () {
  const Plane = new THREE.PlaneGeometry(200, 200);
  const snowTexture = new THREE.TextureLoader()
  const snowDisplacementMap = snowTexture.load('./public/texture/Snow2/snow_02_diff_4k.jpg')
  // const snowColorMap = snowTexture.load('./public/texture/Snow/Snow005_2K_Color.png')
  const snowNormalMap = snowTexture.load('./public/texture/Snow2/snow_02_nor_gl_4k.jpg')
  const snowRoughnessMap = snowTexture.load('./public/texture/Snow2/snow_02_rough_4k.jpg')
  const PlaneMaterial = new THREE.MeshStandardMaterial({
      displacementMap: snowDisplacementMap,
      normalMap: snowNormalMap,
      roughnessMap: snowRoughnessMap,
      side: THREE.DoubleSide, // 使用双面材质
      color: 'rgb(255, 255, 255)'
  });
  const PlaneMesh = new THREE.Mesh(Plane, PlaneMaterial);
  PlaneMesh.position.set(0, -1, 0)
  PlaneMesh.rotation.x = (-Math.PI / 2)
  PlaneMesh.receiveShadow = true
  scene.add(PlaneMesh);

}





/**
 * 添加比例尺辅助
 */
function createControlAxesHelper () {

  control.enableDamping = true;
  // 比例尺辅助
  var axisHelper = new AxesHelper( 100);
  scene.add( axisHelper );
}


/**
 * 创建圣诞树的环绕光
 * @param {*} scene 
 */
function addTwinklingLights(scene) {
  const particleCount = 150;
  const positions = [
    10, 50, 50
  ];
  const colors = [];
  const color = new THREE.Color();

  // 生成螺旋排列的粒子
  for (let i = 0; i < particleCount; i++) {
    const angle = i * 0.2; // 每个粒子的角度间隔
    const radius = 8;      // 螺旋半径
    const heightStep = 0.15; // 高度增量

    const x = radius * Math.cos(angle); // x 坐标
    const z = radius * Math.sin(angle); // z 坐标
    const y = i * heightStep;           // y 坐标

    positions.push(x, y, z);

    // 冷色调颜色
    color.setHSL(Math.random() * 0.25 + 0.5, 1.0, 0.6);
    colors.push(color.r, color.g, color.b);
  }

  // 创建粒子几何和材质
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthTest: true,
  });

  // 创建粒子系统
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.position.set(-30, 0, 0);
  scene.add(particles);
  // 动态调整透明度，模拟闪烁效果
  function animateLights() {
    const time = Date.now() * 0.005; // 获取时间
    const opacity = (Math.sin(time) + 1) / 2 * 0.7 + 0.7; // 波动透明度

    particleMaterial.opacity = opacity; // 修改透明度
    requestAnimationFrame(animateLights);
  }
  animateLights();
}




/**
 * 加载女模模型
 */
function loadGirlModel() {
  const loader = new GLTFLoader();
  let model=null;
  loader.load( 'models/gltf/winterfest_bushranger_fortnite_skin.glb', function ( gltf ) {
    model = gltf.scene;
    spotLight.target = gltf.scene;
    model.children[ 0 ].children[ 0 ].castShadow = true;
    model.scale.set(20, 20, 20);
    model.position.set(0, 0, 20);
    mixer = new THREE.AnimationMixer( model );
    const action = mixer.clipAction( gltf.animations[ 0 ] );
    action.play();
    scene.add( model );
  } );
}

function animate() {
  const delta = clock.getDelta();
  if ( mixer ) mixer.update( delta );
}

function createAudio () {
  // // 加载音频
  // const audioLoader = new THREE.AudioLoader();
  // audioLoader.load('public/music/ddd.ogg', function(buffer) {
  //   sound.setBuffer(buffer);
  //   sound.setLoop(true);
  //   sound.setRefDistance( 20 );
  //   sound.setVolume(0.5);
  //   sound.play();
  // });
  // return audioLoader;
}





// 渲染动画
function render() {
  control.update();
  camera.updateProjectionMatrix()
  renderer.setAnimationLoop( animate );
  updateSnow();
  requestAnimationFrame(render);
  renderer.render(scene, camera)
}

scene.background = new THREE.Color("rgb(25,43,80)");

// setSceneBackground(); // 初始化场景配置
setCamera(); // 初始化相机配置
setRendererOption(); // 初始化渲染器配置


const spotLight = createSpotLight();
scene.add(spotLight);

const ambientlight = createAmbientLight();
scene.add(ambientlight);

const directionalLight = createDicLight();
scene.add(directionalLight);

const pointLight = createPointLight();
scene.add(pointLight);


loadSnowfield(); // 加载雪地

loadTreeModel(); // 加载圣诞树

loadShopModel(); // 加载商店

loadGirlModel(); // 加载跳舞的模型



const pointMesh = createSnow(); // 添加雪花
scene.add(pointMesh);

addTwinklingLights(scene); // 添加闪烁灯

createControlAxesHelper(); // 添加十字轴

createAudio();

render();

document.body.appendChild(renderer.domElement);


