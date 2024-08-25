
var threeScene;
var renderer;
var camera;
var cameraControl;

function initThreeScene(){
    threeScene = new THREE.Scene();

	// Lights		
    threeScene.add( new THREE.AmbientLight( 0x505050 ) );	
    threeScene.fog = new THREE.Fog( 0x000000, 0, 15 );				

    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.2;
    spotLight.position.set( 2, 3, 3 );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 3;
    spotLight.shadow.camera.far = 10;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    threeScene.add( spotLight );

    var dirLight = new THREE.DirectionalLight( 0x55505a, 1 );
    dirLight.position.set( 0, 3, 0 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 10;

    dirLight.shadow.camera.right = 1;
    dirLight.shadow.camera.left = - 1;
    dirLight.shadow.camera.top	= 1;
    dirLight.shadow.camera.bottom = - 1;

    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    threeScene.add( dirLight );
    
    // Geometry

    var ground = new THREE.Mesh(
        new THREE.PlaneBufferGeometry( 20, 20, 1, 1 ),
        new THREE.MeshPhongMaterial( { color: 0xa0adaf, shininess: 150 } )
    );				

    ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
    ground.receiveShadow = true;
    threeScene.add( ground );
    
    var helper = new THREE.GridHelper( 20, 20 );
    helper.material.opacity = 1.0;
    helper.material.transparent = true;
    helper.position.set(0, 0.002, 0);
    threeScene.add( helper );				
    
    // Renderer

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 0.8 * window.innerWidth, 0.8 * window.innerHeight );
    window.addEventListener( 'resize', onWindowResize, false );
    container.appendChild( renderer.domElement );
    
    // Camera
            
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.set(0, 1, 4);
    camera.updateMatrixWorld();	

    threeScene.add( camera );

    cameraControl = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControl.zoomSpeed = 2.0;
    cameraControl.panSpeed = 0.4;
}

var physicsScene = {
    gravity : new THREE.Vector3(0.0, -9.8, 0.0),
    dt : 1.0 / 60.0,
    worldSize : {x: 1.5, z:2.5},
    paused: true,
    objects: [],
};

class Ball{
    constructor(rad, pos, vel){
        this.rad = rad;
        this.pos = pos;
        this.vel = vel;

        this.sphereGeo = new THREE.SphereGeometry(rad, 32, 32);
        this.sphereMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        this.visMesh = new THREE.Mesh(this.sphereGeo, this.sphereMat);
        this.visMesh.position.copy(pos);
        threeScene.add(this.visMesh);
    }

    simulate(){
        this.vel.addScaledVector(physicsScene.gravity, physicsScene.dt);
        this.pos.addScaledVector(this.vel, physicsScene.dt);

        if (this.pos.x < -physicsScene.worldSize.x) {
            this.pos.x = -physicsScene.worldSize.x; this.vel.x = -this.vel.x;
        }
        if (this.pos.x >  physicsScene.worldSize.x) {
            this.pos.x =  physicsScene.worldSize.x; this.vel.x = -this.vel.x;
        }
        if (this.pos.z < -physicsScene.worldSize.z) {
            this.pos.z = -physicsScene.worldSize.z; this.vel.z = -this.vel.z;
        }
        if (this.pos.z >  physicsScene.worldSize.z) {
            this.pos.z =  physicsScene.worldSize.z; this.vel.z = -this.vel.z;
        }
        if (this.pos.y < this.rad) {
            this.pos.y = this.rad; this.vel.y = -this.vel.y;
        }

        this.visMesh.position.copy(this.pos);
    }
}

function initPhysics(){
    var radius = 0.2;
    var pos = new THREE.Vector3(radius, radius, radius);
    var vel = new THREE.Vector3(2.0, 5.0, 3.0);
    
    physicsScene.objects.push(new Ball(radius, pos, vel)); 
}

// Simulate --------------
function simulate(){
    if (!paused)
        for (var i=0; i<physicsScene.objects.length; i++)
            physicsScene.objects[i].simulate();
}

var paused = true;

function run(){
    var button = document.getElementById('buttonRun');
    if (paused)
        button.innerHTML = "Stop";
    else
        button.innerHTML = "Run";
    paused = !paused;
}

function restart(){
    location.reload();
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Updating --------------
function update(){
    simulate();
    renderer.render(threeScene, camera);
    cameraControl.update();
    requestAnimationFrame(update);
}

initThreeScene();
initPhysics();
update();