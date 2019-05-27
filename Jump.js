var Jump = function () {
    console.log("123");
    this.config = {
        isMobile: false,
        cameraRange: 30,
        background: 0x282828,

        potentialEnergyUnit: 0.01,
        distanceUnit: 5,
        heightUnit: 5,
    };

    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    this.jumperStatus = {
        isReadyToJump: false,
        potentialEnergy: 0,
    };

    this.scene = new THREE.Scene();

    // this.camera = new THREE.OrthographicCamera(window.innerWidth/-40, window.innerWidth/40, window.innerHeight/40, window.innerHeight/-40, 0, 5000);
    this.camera = new THREE.OrthographicCamera(
        this.size.width/(-1 * this.config.cameraRange), this.size.width/this.config.cameraRange,
        this.size.height/this.config.cameraRange, this.size.height/(-1 * this.config.cameraRange),
        0, 5000);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.shadowMapEnabled = true;

    document.getElementById("Main-Container").appendChild(this.renderer.domElement);

    var axes = new THREE.AxisHelper(20);
    this.scene.add(axes);

    var planeGeometry = new THREE.PlaneGeometry(this.size.width, this.size.height);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    // this.scene.add(plane);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;

    this.scene.add(spotLight);
};


Jump.prototype = {

    init: function () {
        window.console.log("is Initing");

        this._checkUserAgent();
        this._adjustCamera();
        this._createJumper();

        this.renderer.render(this.scene, this.camera);

        var self = this;
        var mouseEvents = (self.config.isMobile)?{
            down: 'touchstart',
            up: 'touchend',
        }:{
            down: 'mousedown',
            up: 'mouseup',
        };

        var canvas = document.querySelector('canvas');
        canvas.addEventListener(mouseEvents.down, function () {
            self._mouseDown();
        });
        canvas.addEventListener(mouseEvents.up, function () {
            self._mouseUp();
        });
    },

    _checkUserAgent: function () {
        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i)){
            this.config.isMobile = true
        }
    },

    _adjustCamera: function(){
        this.camera.position.x = -100;
        this.camera.position.y = 125;
        this.camera.position.z = 100;
        this.camera.lookAt(this.scene.position);
    },

    _createCube: function(){
        var cubeGeometry = new THREE.BoxGeometry(4,4,4);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;

        cube.position.x = 0;
        cube.position.y = 0;
        cube.position.z = 0;

        this.scene.add(cube);
    },

    _createJumper: function(){
        var self = this;
        var material = new THREE.MeshLambertMaterial({color: 0x282828});
        var bodyGeometry = new THREE.CylinderGeometry(1, 1.5, 6, 64, 64);
        bodyGeometry.translate(0, 3, 0);

        var headGeometry = new THREE.SphereGeometry(1, 64, 64);
        headGeometry.translate(0, 4, 0);

        this.jumperBody = new THREE.Mesh(bodyGeometry, material);
        this.jumperBody.position.set(0, 0, 0);
        this.jumperHead = new THREE.Mesh(headGeometry, material);
        this.jumperHead.position.set(0, 3, 0);

        this.jumperBody.castShadow = true;
        this.jumperHead.castShadow = true;

        this._jumper = new THREE.Group();
        this._jumper.add(this.jumperBody);
        this._jumper.add(this.jumperHead);

        this.scene.add(this._jumper);
    },

    _mouseDown: function () {
        window.console.log("DOWN");
        var self = this;

        self.jumperStatus.isReadyToJump = false;
        self.jumperStatus.potentialEnergy = 0;

        function act(){
            if(self._jumper.scale.y > 0.35){
                self._jumper.scale.y -= 0.02;

                self.mouseDownFrameHandler = requestAnimationFrame(act);

                self.jumperStatus.potentialEnergy += self.config.potentialEnergyUnit;
            }
            self.renderer.render(self.scene, self.camera);
        }
        act();
    },

    _mouseUp: function () {
        window.console.log("UP");
        var self = this;

        cancelAnimationFrame(self.mouseDownFrameHandler);
        var frameHandler;

        function act() {

            if (!self.jumperStatus.isReadyToJump && self._jumper.position.y > 0 || self.jumperStatus.potentialEnergy > 0){

                self._jumper.scale.y += 0.01;
                self._jumper.position.y += self.jumperStatus.potentialEnergy * self.config.heightUnit;

                self.jumperStatus.potentialEnergy -= self.config.potentialEnergyUnit;

                self.renderer.render(self.scene, self.camera);

                frameHandler = requestAnimationFrame(act);
            }else{
                cancelAnimationFrame(frameHandler);
            }
        }
        act();
    },

};



