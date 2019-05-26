var Jump = function () {
    console.log("123");
    this.config = {
        cameraRange: 50,
        background: 0x282828
    };

    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    this.scene = new THREE.Scene();

    // this.camera = new THREE.OrthographicCamera(window.innerWidth/-40, window.innerWidth/40, window.innerHeight/40, window.innerHeight/-40, 0, 5000);
    this.camera = new THREE.OrthographicCamera(
        this.size.width/(-1 * this.config.cameraRange), this.size.width/this.config.cameraRange,
        this.size.height/this.config.cameraRange, this.size.height/(-1 * this.config.cameraRange),
        0, 5000);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.shadowMapEnabled = true;

    var axes = new THREE.AxisHelper(20);
    this.scene.add(axes);

    var planeGeometry = new THREE.PlaneGeometry(60, 20);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    var light = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(light);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    this.directionalLight.distance = 0;
    this.directionalLight.position.set(60, 50, 40);
    this.directionalLight.castShadow = true;
    this.directionalLight.intensity = 0.5;
    this.scene.add(this.directionalLight);


    this.scene.add(plane);
};


Jump.prototype = {
    // init: function () {
    //     window.console.log("is Initing");
    //
    //
    //     document.getElementById("Main-Container").appendChild(this.renderer.domElement);
    //
    //     this.renderer.render(this.scene, this.camera);
    // },



    init: function () {
        window.console.log("is Initing");

        this.camera.position.x = 100;
        this.camera.position.y = 100;
        this.camera.position.z = 100;
        this.camera.lookAt(this.scene.position);

        // add the cube to the scene
        this._createCube();

        // var spotLight = new THREE.SpotLight(0xffffff);
        // spotLight.position.set(-40, 60, -10);
        // spotLight.castShadow = true;
        // this.scene.add(spotLight);

        document.getElementById("Main-Container").appendChild(this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);
    },

    _createCube: function(){
        var cubeGeometry = new THREE.BoxGeometry(4,4,4);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff00000});

        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;

        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = 0;

        this.scene.add(cube);
    },

    _createJumper: function(){
        var self = this;
        var material = new THREE.MeshLambertMaterial({color: this.config.jumperColor});
        var bodyGeometry = new THREE.CylinderGeometry(this.config.jumperWidth/3, this.config.jumperDeep/2, this.config.jumperHeiht/1, 40);
        var headGeometry = new THREE.SphereGeometry(this.config.jumperDeep/2, 32, 32);
        // bodyGeometry.translate(0,1,0);
        // headGeometry.translate(0,2.4,0);
        this.jumperBody = new THREE.Mesh(bodyGeometry, material);
        this.jumperHead = new THREE.Mesh(headGeometry, material);
        this.jumperBody.castShadow = true;
        this.jumperHead.castShadow = true;

        var _jumper = new THREE.Group();
        _jumper.add(this.jumperBody);
        _jumper.add(this.jumperHead);
        _jumper.position.y = 3;
        _jumper.position.x = this.config.jumperWidth/2;
        _jumper.position.z = this.config.jumperWidth/2;

        this.jumper = _jumper;
        this.scene.add(this.jumper);

        this.directionalLight.target = this.jumper;

        this._createCube();

    },

};



//
// Jump.prototype = {
//     init: function () {
//         var self = this;
//         // create a scene, that will hold all our elements such as objects, cameras and lights.
//         this.scene = new THREE.Scene();
//
//         // create a camera, which defines where we're looking at.
//         // this.camera = new THREE.OrthographicCamera(this.size.width/-80, this.size.width/80, this.size.height/80, this.size/80, 0, 5000);
//         this.camera = new THREE.OrthographicCamera(this.size.width/-80, this.size.width/80, this.size.height/80, this.size.height/-80, 0, 5000);
//         // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
//
//         // create a render and set the size
//         this.renderer = new THREE.WebGLRenderer();
//         this.renderer.setClearColorHex();
//         this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//
//         // show axes in the screen
//         this.axes = new THREE.AxisHelper(20);
//         this.scene.add(this.axes);
//
//         // create the ground plane
//         var planeGeometry = new THREE.PlaneGeometry(60, 20);
//         var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
//         this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
//
//         // rotate and position the plane
//         this.plane.rotation.x = -0.5 * Math.PI;
//         this.plane.position.x = 15;
//         this.plane.position.y = 0;
//         this.plane.position.z = 0;
//
//         // add the plane to the scene
//         this.scene.add(this.plane);
//
//         // create a cube
//         this.cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
//         this.cubeMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
//         this.cube = new THREE.Mesh(this.cubeGeometry, this.cubeMaterial);
//
//         // position and point the camera to the center of the scene
//         this.camera.position.x = 100;
//         this.camera.position.y = 100;
//         this.camera.position.z = 100;
//         this.camera.lookAt(this.scene.position);
//
//         this._createCube();
//
//         // add the output of the renderer to the html element
//         document.getElementById("Main-Container").appendChild(this.renderer.domElement);
//
//         // render the scene
//         this.renderer.render(this.scene, this.camera);
//     },
//
//     _createCube: function(){
//         var cubeGeometry = new THREE.BoxGeometry(4,4,4);
//         var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff00000});
//
//         var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
//         cube.castShadow = true;
//
//         cube.position.x = 0;
//         cube.position.y = 0;
//         cube.position.z = 0;
//
//         this.scene.add(cube);
//     },
// };


