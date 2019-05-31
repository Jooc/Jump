var Jump = function () {
    console.log("123");

    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    this.config = {
        isMobile: false,
        cameraRange: 30,
        background: 0x282828,

        potentialEnergyUnit: 0.05,
        distanceUnit: 0.25,
        heightUnit: 0.5,

        cameraMoveUnit: 0.05,

        jumperSize: {
          x: 1.5,
          y: 6,
          z: 1.5,
        },

        cubeSize: {
            x: 9,
            y: 4.5,
            z: 9,
        },

        maxDistance: 10,
        maxCubeNum: 10,
    };

    this.jumperStatus = {
        isReadyToJump: false,
        potentialEnergy: 0,
    };

    this.cubeList = [];



    this.scene = new THREE.Scene();

    // this.camera = new THREE.OrthographicCamera(window.innerWidth/-40, window.innerWidth/40, window.innerHeight/40, window.innerHeight/-40, 0, 5000);
    this.camera = new THREE.OrthographicCamera(
        this.size.width/(-1 * this.config.cameraRange), this.size.width/this.config.cameraRange,
        this.size.height/this.config.cameraRange, this.size.height/(-1 * this.config.cameraRange),
        0, 5000);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.shadowMap.enabled = true;

    document.getElementById("Main-Container").appendChild(this.renderer.domElement);

    var axes = new THREE.AxesHelper(20);
    this.scene.add(axes);

    var planeGeometry = new THREE.PlaneGeometry(this.size.width, this.size.height);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    this.scene.add(plane);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;

    this.scene.add(spotLight);
};


Jump.prototype = {

    init: function () {
        window.console.log("is Initing");

        this._checkUserAgent();
        this._initCamera();
        this._createJumper();
        this.UpdateCube();


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

    _initCamera: function(){
        this.camera.position.x = -100;
        this.camera.position.y = 125;
        this.camera.position.z = 100;
        this.camera.lookAt(this.scene.position);
    },

    _adjustCamera: function(){
        // window.console.log("adjusting Camera");
        var self = this;

        var origin = {
            x: self.camera.position.x,
            y: self.camera.position.y,
            z: self.camera.position.z,
        };

        var target = {
            x: self.jumperBody.position.x - 100,
            y: self.jumperBody.position.y + 125,
            z: self.jumperBody.position.z + 100,
        };

        var direction = new THREE.Vector3(target.x - origin.x, target.y - origin.y, target.z - origin.z);

        if(self.camera.position.x < self.jumperBody.position.x - 100){
            self.camera.translateOnAxis(direction, self.config.cameraMoveUnit);

            self.renderer.render(self.scene, self.camera);
            requestAnimationFrame(function () {
                self._adjustCamera();
            })
        }
    },

    /**
     * @return {number}
     */
    CalculateDistance: function(beginPoint, endPoint){
        return Math.sqrt(Math.pow((beginPoint.x - endPoint.x),2)
            + Math.pow((beginPoint.y - endPoint.y),2) + Math.pow((beginPoint.z - endPoint.z),2))
    },

    UpdateCube: function(){
        //TO INIT
        if (this.cubeList.length === 0){
            this._createCube(0, 0, 0);
        }

        //TO Update

        var

        this._createCube(nextCubePosition.x, nextCubePosition.y, nextCubePosition.z)
        // this._createCube(0, 0, 0);
    },

    _getNextDirection: function(){
        var direction = '';

        var disition = Math.random();

        if (disition < 0.33){
            direction = 'left';
        }else if (disition <0.66){
            direction = 'right';
        }else{
            direction = 'straight';
        }

        var currentCube = this.cubeList[this.cubeList.length-1];

        var nextCubePosition = {
            x: 0, y: 0, z: 0,
        };

        nextCubePosition.x = currentCube.position.x;
        nextCubePosition.y = currentCube.position.y;
        nextCubePosition.z = currentCube.position.z;

        //TODO: TEST the direction
        if (direction === 'left'){
            nextCubePosition.x -= this.config.maxDistance * Math.random() + this.config.cubeSize.x;
        }else if (direction === 'right'){
            nextCubePosition.x += this.config.maxDistance * Math.random() + this.config.cubeSize.x;
        }else{
            nextCubePosition.z += this.config.maxDistance * Math.random() + this.config.cubeSize.x;
        }

        return direction;
    },

    _createCube: function(coordinateX, coordinateY, coordinateZ){
        window.console.log("Creating Cube");

        var cubeGeometry = new THREE.BoxGeometry(this.config.cubeSize.x,this.config.cubeSize.y, this.config.cubeSize.z);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x99EBFF});

        cubeGeometry.translate(0, this.config.cubeSize.y/2, 0);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        cube.castShadow = true;
        cube.receiveShadow = true;

        cube.position.x = coordinateX;
        cube.position.y = coordinateY;
        cube.position.z = coordinateZ;

        this.cubeList.push(cube);

        if (this.cubeList.length > this.config.maxCubeNum){
            window.console.log(this.cubeList.shift());
        }


        window.console.log(this.cubeList);
        this.scene.add(cube);
    },

    _createJumper: function(){
        var self = this;
        var material = new THREE.MeshLambertMaterial({color: 0x282828});
        var bodyGeometry = new THREE.CylinderGeometry(1, 1.5, 6, 64, 64);
        bodyGeometry.translate(0, 3, 0);

        var headGeometry = new THREE.SphereGeometry(1, 64, 64);
        headGeometry.translate(0, 7.5, 0);

        this.jumperBody = new THREE.Mesh(bodyGeometry, material);
        this.jumperBody.position.set(0, this.config.cubeSize.y, 0);
        this.jumperHead = new THREE.Mesh(headGeometry, material);
        this.jumperHead.position.set(0, this.config.cubeSize.y, 0);

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
            if(self.jumperBody.scale.y > 0.35){
                self.jumperBody.scale.y -= 0.02;
                self.jumperHead.scale.y -= 0.02;

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

            if (!self.jumperStatus.isReadyToJump && self.jumperBody.position.y > self.config.cubeSize.y || self.jumperStatus.potentialEnergy > 0){

                self.jumperBody.scale.y += 0.01;
                self.jumperHead.scale.y += 0.01;

                self.jumperBody.position.x += self.config.distanceUnit;
                self.jumperHead.position.x += self.config.distanceUnit;
                self.jumperBody.position.y += self.jumperStatus.potentialEnergy * self.config.heightUnit;
                self.jumperHead.position.y += self.jumperStatus.potentialEnergy * self.config.heightUnit;

                self.jumperStatus.potentialEnergy -= self.config.potentialEnergyUnit;

                self.renderer.render(self.scene, self.camera);

                frameHandler = requestAnimationFrame(act);
            }else{
                cancelAnimationFrame(frameHandler);
                self._adjustCamera();
                self.UpdateCube();
            }
        }
        act();

    },

};



