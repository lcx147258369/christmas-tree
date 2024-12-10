import { Mesh, MeshStandardMaterial,CircleGeometry, PerspectiveCamera, Scene, SphereGeometry, TextureLoader, WebGLRenderer, AmbientLight, AxesHelper, EquirectangularReflectionMapping} from "three";
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";
import { RGBELoader } from "three/examples/jsm/loaders/rgbeloader";
import { Water } from "three/examples/jsm/objects/Water2.js";



const scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 10, 200); //设置相机位置

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);



// const sphereGeometry = new SphereGeometry(50, 60, 60);
// const sphereMaterial = new MeshStandardMaterial({
//     color: 0xffffff
// });


// sphereGeometry.scale(5, 5, -5);
// const Sphere = new Mesh(sphereGeometry, sphereMaterial) 
// scene.add(Sphere)


const light = new AmbientLight( 0xffffff, 0.9); // soft white light
scene.add( light );

var axisHelper = new AxesHelper( 100);
scene.add( axisHelper );


const control = new OrbitControls(camera, renderer.domElement)
control.enableDamping = true;



const loader = new RGBELoader().load('./snowy_field_4k.hdr', (texture) => {
    texture.mapping = EquirectangularReflectionMapping
    scene.background = texture;
    scene.environment = true;
});


const waterGeometry = new CircleGeometry(500, 500)

const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    color: 0xeeeeff,
    flowDirection: new THREE.Vector2(1,1),
    scale: 2
})
water.rotation.x = -Math.PI / 2;
water.position.y = -100
scene.add(water)

function render () {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render()

document.body.appendChild(renderer.domElement)