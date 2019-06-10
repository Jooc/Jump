var MoveStage = {
    Waiting: 0,
    StoringEnergy: 1,
    MovingJumper: 2,
    MovingCamera: 3,
};

var LandType = {
    //InCurrent: 落在当前方块内
    //OnEdgeOfCurrent: 落在当前方块的边缘（不稳
    //InNext: 落在下一方块内部
    //OnEdgeOfNext: 落在下一方块的边缘 (不稳
    //OutSide: 直接跌落

    InCurrent: 'inCurrent',
    OnEdgeOfCurrent: 'OnEdgeOfCurrent',
    InNext: 'inNext',
    OnEdgeOfNext: 'OnEdgeOfNext',
    OutSide: 'OutSide',
};

var Direction = {
    Straight: 'straight',
    Left: 'left',
    Right: 'right',
};

var Jump = function () {
    this.score = 0;

    this.size = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    this.config = {
        isMobile: false,
        cameraRange: 30,
        background: 0x282828,

        // PotentialEnergyUnit: 0.05,
        distanceUnit: 0.5,
        heightUnit: 0.75,
        rotationUnit: 0.1,

        cameraMoveUnit: 0.5,

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

        maxDistance: 20,
        minDistance: 15,

        maxCubeNum: 10,
    };

    this.jumperStatus = {
        status: MoveStage.Waiting,
        potentialEnergy: 0,

        lastDirection: '',
        currentDirection: '',
    };

    this.cubeList = [];

    this.scene = new THREE.Scene();

    // this.camera = new THREE.OrthographicCamera(window.innerWidth/-40, window.innerWidth/40, window.innerHeight/40, window.innerHeight/-40, 0, 5000);
    this.camera = new THREE.OrthographicCamera(
        this.size.width/(-1 * this.config.cameraRange), this.size.width/this.config.cameraRange,
        this.size.height/this.config.cameraRange, this.size.height/(-1 * this.config.cameraRange),
        0, 5000);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setClearColor(new THREE.Color(0xEEEEEE));
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.shadowMap.enabled = true;

    document.getElementById("Main-Container").appendChild(this.renderer.domElement);

    // var axes = new THREE.AxesHelper(20);
    // this.scene.add(axes);

    var planeGeometry = new THREE.PlaneGeometry(this.size.width, this.size.height);
    var planeMaterial = new THREE.MeshBasicMaterial({color: '#dedede'});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;

    this.scene.add(plane);

    // var spotLight = new THREE.SpotLight(0xffffff);
    // spotLight.position.set(-40, 60, -10);
    // spotLight.castShadow = true;
    //
    // this.scene.add(spotLight);
    // this.scene.add(spotLight);

    var ambiColor = "#d5d5d5";
    var ambientLight = new THREE.AmbientLight(ambiColor);

    this.scene.add(ambientLight);

    var direColor = "#9a9a9a";
    var directionalLight = new THREE.DirectionalLight(direColor);
    directionalLight.position.set(40, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;


    directionalLight.distance = 0;
    directionalLight.intensity = 0.5;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    this.scene.add(directionalLight);

    this.controls = new function () {
        this.PotentialEnergyUnit = 0.05;
        this.DistanceUnit = 0.5;
        this.HeightUnit = 0.75;
    };

    var gui = new dat.GUI();
    // gui.add(this.controls, 'PotentialEnergyUnit', 0, 0.1);
    gui.add(this.controls, 'DistanceUnit', 0, 1);
    gui.add(this.controls, 'HeightUnit', 0, 1.5);

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

        self.score = 0;

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
        canvas.addEventListener('resize', function () {
            self._windowResize();
        })
    },

    RestartHandler: function(func){
        this.restartCallback = func;
    },

    SuccessHandler: function(func){
        window.console.log("Adding Success");
        this.successCallback = func;
    },

    FailHandler: function(func){
        window.console.log("Adding Fail");
        this.failCallback = func;
    },

    _windowResize: function(){
        this.camera.left = window.innerWidth / -80;
        this.camera.right = window.innerWidth / 80;
        this.camera.top = window.innerHeight / 80;
        this.camera.bottom = window.innerHeight / -80;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.render(this.scene, this.camera);
    },

    _checkUserAgent: function () {
        var env = navigator.userAgent;
        if (env.match(/Android/i) || env.match(/webOS/i) || env.match(/iPhone/i) ||
            env.match(/iPad/i) || env.match(/iPod/i) || env.match(/BlackBerry/i)) {
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

        if (self.jumperStatus.status !== MoveStage.MovingCamera){
            window.console.log("Invalid Timing @ adjusting Camera");
            return;
        }

        var target = {
            x: self.jumperBody.position.x - 100,
            y: self.jumperBody.position.y + 125,
            z: self.jumperBody.position.z + 100,
        };

        var cameraMoveHandler;

        // window.console.log("moving Camera");
        // window.console.log(self.jumperStatus.lastDirection);

        cameraMove();

        function cameraMove() {

            if (self.jumperStatus.lastDirection === Direction.Straight){
                // window.console.log(self.camera.position.x);
                // window.console.log(self.jumperBody.position.x);
                // window.console.log(target.x);

                if (self.camera.position.x !== target.x) {

                    self.camera.position.x += self.config.cameraMoveUnit;

                    if (target.x - self.camera.position.x < 0.25){
                        self.camera.position.x = target.x;
                    }

                    self.renderer.render(self.scene, self.camera);
                    cameraMoveHandler = requestAnimationFrame(cameraMove);
                } else {
                    // window.console.log("canceling");
                    cancelAnimationFrame(cameraMoveHandler);

                    self.SwitchStage();
                    return;
                }
            }else if (self.jumperStatus.lastDirection === Direction.Left){
                if (self.camera.position.z !== target.z) {

                    self.camera.position.z -= self.config.cameraMoveUnit;

                    if (self.camera.position.z - target.z < 0.25){
                        self.camera.position.z = target.z;
                    }

                    self.renderer.render(self.scene, self.camera);
                    cameraMoveHandler = requestAnimationFrame(cameraMove);
                } else {
                    // window.console.log("canceling");
                    cancelAnimationFrame(cameraMoveHandler);

                    self.SwitchStage();
                    return;
                }
            }else if (self.jumperStatus.lastDirection === Direction.Right) {
                if (self.camera.position.z !== target.z) {

                    self.camera.position.z += self.config.cameraMoveUnit;

                    if (target.z - self.camera.position.z < 0.25){
                        self.camera.position.z = target.z;
                    }

                    self.renderer.render(self.scene, self.camera);
                    cameraMoveHandler = requestAnimationFrame(cameraMove);
                } else {
                    // window.console.log("canceling");
                    cancelAnimationFrame(cameraMoveHandler);

                    self.SwitchStage();
                    return;
                }
            }else{
                window.console.log("Invalid Direction");
                return;
            }
        }
    },


    // /**
    //  * @return {number}
    //  */
    // CalculateDistance: function(beginPoint, endPoint){
    //     return Math.sqrt(Math.pow((beginPoint.x - endPoint.x),2)
    //         + Math.pow((beginPoint.y - endPoint.y),2) + Math.pow((beginPoint.z - endPoint.z),2))
    // },

    UpdateCube: function(){

        // window.console.log("Updating Cube");

        //TO INIT
        if (this.cubeList.length === 0){
            this._createCube(0, 0, 0);
        }

        //TO Update

        var direction = this._getDirection();
        this.jumperStatus.lastDirection = this.jumperStatus.currentDirection;
        this.jumperStatus.currentDirection = direction;

        var currentCube = this.cubeList[this.cubeList.length-1];

        var nextCubePosition = {
            x: 0, y: 0, z: 0,
        };

        nextCubePosition.x = currentCube.position.x;
        nextCubePosition.y = currentCube.position.y;
        nextCubePosition.z = currentCube.position.z;

        //DONE: TEST the direction
        if (direction === Direction.Left){
            nextCubePosition.z -= this.config.maxDistance * Math.random() + this.config.minDistance;
        }else if (direction === Direction.Right){
            nextCubePosition.z += this.config.maxDistance * Math.random() + this.config.minDistance;
        }else{
            nextCubePosition.x += this.config.maxDistance * Math.random() + this.config.minDistance;
        }

        this._createCube(nextCubePosition.x, nextCubePosition.y, nextCubePosition.z)
        // this._createCube(0, 0, 0);
    },

    _getDirection: function(){
        this.jumperStatus.lastDirection = this.jumperStatus.currentDirection;

        // INIT
        if (this.cubeList.length === 1){
            return Direction.Straight;
        }

        var direction = '';
        var disition = Math.random();

        if (this.jumperStatus.lastDirection === Direction.Left){
            direction = disition >= 0.5? Direction.Left: Direction.Straight;
        }else if(this.jumperStatus.lastDirection === Direction.Right){
            direction = disition >= 0.5? Direction.Right: Direction.Straight;
        }else{
            if (disition < 0.33){
                direction = Direction.Left;
            }else if (disition <0.66){
                direction = Direction.Right;
            }else{
                direction = Direction.Straight;
            }
        }

        return direction;
    },

    _createCube: function(coordinateX, coordinateY, coordinateZ){
        // window.console.log("Creating Cube");

        var cubeGeometry = new THREE.BoxGeometry(this.config.cubeSize.x,this.config.cubeSize.y, this.config.cubeSize.z);
        var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x99EBFF});
        var cubeMaterial = new THREE.MeshLambertMaterial({color: "#404040"});

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

        // window.console.log(this.cubeList);
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

        this.jumperStatus.status = MoveStage.Waiting;
        this.jumperStatus.currentDirection = Direction.Straight;
    },

    _mouseDown: function () {
        // window.console.log("DOWN");
        var self = this;

        if(self.jumperStatus.status !== MoveStage.Waiting){
            window.console.log("Invalid Timing @ mouseDown");
            return;
        }

        self.SwitchStage();
        // window.console.log(this.jumperStatus.status);

        self.jumperStatus.isReadyToJump = true;
        self.jumperStatus.potentialEnergy = 0;

        function act(){
            if(self.jumperBody.scale.y > 0.35){
                self.jumperBody.scale.y -= 0.02;
                self.jumperHead.scale.y -= 0.02;

                self.mouseDownFrameHandler = requestAnimationFrame(act);

                self.jumperStatus.potentialEnergy += self.controls.PotentialEnergyUnit;
            }
            self.renderer.render(self.scene, self.camera);
        }
        act();
    },

    _mouseUp: function () {
        // window.console.log("UP");
        var self = this;

        if(self.jumperStatus.status !== MoveStage.StoringEnergy ){
            window.console.log("Invalid Timing @ mouseUp");
            return;
        }

        self.SwitchStage();
        // window.console.log(self.jumperStatus.status);

        cancelAnimationFrame(self.mouseDownFrameHandler);
        var frameHandler;

        act();

        function act() {
            //-0.1 用于消除误差
            // if (self.jumperBody.position.y > self.config.cubeSize.y || self.jumperStatus.potentialEnergy > 0){
            if (self.jumperBody.scale.y < 1){

                // window.console.log(self.jumperBody.position.y);
                // window.console.log(self.jumperBody.scale.y);
                // window.console.log("energy:" + self.jumperStatus.potentialEnergy);

                self._jumperMove();

                self.renderer.render(self.scene, self.camera);

                frameHandler = requestAnimationFrame(act);
            }else{
                cancelAnimationFrame(frameHandler);

                self.Land();
                // self.UpdateCube();
                // self._adjustCamera();
            }
        }

        window.console.log("################");
    },

    Land: function(){
        var self = this;

        self.jumperBody.position.y = self.config.cubeSize.y;
        self.jumperHead.position.y = self.config.cubeSize.y;

        if (self.jumperStatus.status !== MoveStage.MovingJumper){
            window.console.log("Invalid Timing @ Land");
            return;
        }

        self.SwitchStage();

        window.console.log(self._whereIsJumper());

        switch (self._whereIsJumper()) {
            case LandType.InCurrent:
                self._adjustCamera();
                break;
            case LandType.OnEdgeOfCurrent:
                self._jumperFall(LandType.OnEdgeOfCurrent);
                self.GameOver();
                break;
            case LandType.OnEdgeOfNext:
                self._jumperFall(LandType.OnEdgeOfNext);
                self.GameOver();
                break;
            case LandType.InNext:
                self._jumperLand();
                self.UpdateCube();
                self._adjustCamera();
                break;
            case LandType.OutSide:
                // self._jumperFallingRotate('StraightCloser');
                self._jumperFallStraightly();
                self.GameOver();
                break;
        }

    },


    _whereIsJumper: function(){

        var self = this;

        // window.console.log(self.jumperBody.position.x - self.cubeList[self.cubeList.length - 1].position.x);
        // window.console.log(Math.abs(self.jumperBody.position.z - self.cubeList[self.cubeList.length - 1].position.z));

        var JumperPos = {
            x: self.jumperBody.position.x,
            z: self.jumperBody.position.z,
        };

        var CurrentCubePos = {
            x: self.cubeList[self.cubeList.length - 2].position.x,
            z: self.cubeList[self.cubeList.length - 2].position.z,
        };

        var NextCubePos = {
            x: self.cubeList[self.cubeList.length - 1].position.x,
            z: self.cubeList[self.cubeList.length - 1].position.z,
        };

        var distance = {
            withCurrent: -1,
            withNext: -1,
        };

        if (self.jumperStatus.currentDirection === Direction.Straight){
            distance.withCurrent = Math.abs(JumperPos.x - CurrentCubePos.x);
            distance.withNext = Math.abs(NextCubePos.x - JumperPos.x);
        }else if(self.jumperStatus.currentDirection === Direction.Left){
            distance.withCurrent = Math.abs(CurrentCubePos.z - JumperPos.z);
            distance.withNext = Math.abs(JumperPos.z - NextCubePos.z);
        }else if(self.jumperStatus.currentDirection === Direction.Right){
            distance.withCurrent = Math.abs(JumperPos.z - CurrentCubePos.z);
            distance.withNext = Math.abs(NextCubePos.z - JumperPos.z);
        }else {
            window.console.log("Invalid Direction @ Jumper Position Judging _ 1");
            // window.console.log(self.jumperStatus.lastDirection);
            // window.console.log(self.jumperStatus.currentDirection);
        }

        // window.console.log("Current" + distance.withCurrent);
        // window.console.log("Next" + distance.withNext);

        var threshold_inner = self.config.cubeSize.x / 2;
        var threshold_outer = self.config.cubeSize.x / 2 + 0.75; // 0.75 -> JumperWidth / 2

        if (distance.withCurrent <= threshold_inner){
            return LandType.InCurrent;
        }else if(distance.withCurrent > threshold_inner && distance.withCurrent < threshold_outer){
            return LandType.OnEdgeOfCurrent;
        }else if(distance.withNext < threshold_outer && distance.withNext > threshold_inner){
            return LandType.OnEdgeOfNext;
        }else if (distance.withNext <= threshold_inner){
            return LandType.InNext;
        }else {
            return LandType.OutSide;
        }
    },

    _jumperFallStraightly :function(){

        var self = this;
        var StraightlyFall;

        act();

        function act() {

            if (self.jumperBody.position.y > 0){
                self.jumperBody.position.y += self.controls.HeightUnit * self.jumperStatus.potentialEnergy;
                self.jumperHead.position.y += self.controls.HeightUnit * self.jumperStatus.potentialEnergy;

                // if (self.jumperStatus.currentDirection === Direction.Straight){
                //     self.jumperBody.position.x += self.controls.DistanceUnit;
                //     self.jumperHead.position.x += self.controls.DistanceUnit;
                // }else if (self.jumperStatus.currentDirection === Direction.Left){
                //     self.jumperBody.position.z -= self.controls.DistanceUnit;
                //     self.jumperHead.position.z -= self.controls.DistanceUnit;
                // }else if (self.jumperStatus.currentDirection === Direction.Right){
                //     self.jumperBody.position.z += self.controls.DistanceUnit;
                //     self.jumperHead.position.z += self.controls.DistanceUnit;
                // }

                self.renderer.render(self.scene, self.camera);

                if (Math.abs(self.jumperBody.position.y - 0) < 0.05){
                    self.jumperBody.position.y = 0;
                    self.jumperHead.position.y = 0;
                }

                StraightlyFall = requestAnimationFrame(act);
            }else {
                cancelAnimationFrame(StraightlyFall);
            }
        }
    },

    _jumperFall: function(positionState){
        window.console.log("FALL");

        var self = this;

        var jumperPos = {
            x: self.jumperBody.position.x,
            z: self.jumperBody.position.z,
        };

        var cubePos = {
            x: -1,
            z: -1,
        };

        if (positionState === LandType.OnEdgeOfCurrent){
            cubePos.x = self.cubeList[self.cubeList.length - 2].position.x;
            cubePos.z = self.cubeList[self.cubeList.length - 2].position.z;
        }else if (positionState === LandType.OnEdgeOfNext){
            cubePos.x = self.cubeList[self.cubeList.length - 1].position.x;
            cubePos.z = self.cubeList[self.cubeList.length - 1].position.z;
        }else {
            window.console.log("Invalid PositionState @ Jumper Falling");
        }

        if (self.jumperStatus.currentDirection === Direction.Straight){
            if (jumperPos.x > cubePos.x){
                self._jumperFallingRotate('StraightFarther');
            }else if (jumperPos.x < cubePos.x){
                self._jumperFallingRotate('StraightCloser');
            }else {
                window.console.log("Invalid Relative Position @ Jumper Falling");
            }
        }else if(self.jumperStatus.currentDirection === Direction.Left || self.jumperStatus.currentDirection === Direction.Right){
            if (jumperPos.z > cubePos.z){
                self._jumperFallingRotate('Right');
            }else if(jumperPos.z < cubePos.z){
                self._jumperFallingRotate('Left');
            }else{
                window.console.log("Invalid Relative Position @ Jumper Falling");
            }
        }else {
            window.console.log("Invalid Direction @ Jumper Falling");
        }

    },

    _jumperFallingRotate: function(relativePos){
        var self = this;
        var axis;

        window.console.log("Rotating");
        window.console.log(self.jumperBody.rotation['z']/Math.PI);

        var rotationHandler;
        act();

        function act() {
            switch (relativePos) {
                case 'StraightFarther':
                    if (self.jumperBody.rotation.z > Math.PI / -2){
                        self.jumperBody.rotation.z -= Math.PI / 75;
                        self.jumperHead.rotation.z -= Math.PI / 75;

                        if (self.jumperBody.position.y > 0) {
                            self.jumperBody.position.y -= self.controls.HeightUnit / 20;
                            self.jumperHead.position.y -= self.controls.HeightUnit / 20;
                        }

                        self.renderer.render(self.scene, self.camera);

                        rotationHandler = requestAnimationFrame(act);
                    }else {
                        cancelAnimationFrame(rotationHandler);
                        self._jumperFallToTheGroundAfterRotation();
                    }
                    break;
                case 'StraightCloser':
                    if (self.jumperBody.rotation.z < Math.PI / 2){
                        self.jumperBody.rotation.z += Math.PI / 75;
                        self.jumperHead.rotation.z += Math.PI / 75;

                        if (self.jumperBody.position.y > 0) {
                            self.jumperBody.position.y -= self.controls.HeightUnit / 20;
                            self.jumperHead.position.y -= self.controls.HeightUnit / 20;
                        }

                        self.renderer.render(self.scene, self.camera);

                        rotationHandler = requestAnimationFrame(act);
                    }else {
                        cancelAnimationFrame(rotationHandler);
                        self._jumperFallToTheGroundAfterRotation();
                    }
                    break;
                case 'Right':
                    if (self.jumperBody.rotation.x < Math.PI / 2){
                        self.jumperBody.rotation.x += Math.PI / 75;
                        self.jumperHead.rotation.x += Math.PI / 75;

                        if (self.jumperBody.position.y > 0) {
                            self.jumperBody.position.y -= self.controls.HeightUnit / 20;
                            self.jumperHead.position.y -= self.controls.HeightUnit / 20;
                        }

                        self.renderer.render(self.scene, self.camera);

                        rotationHandler = requestAnimationFrame(act);
                    }else {
                        cancelAnimationFrame(rotationHandler);
                        self._jumperFallToTheGroundAfterRotation();
                    }
                    break;
                case 'Left':
                    if (self.jumperBody.rotation.x > Math.PI / -2){
                        self.jumperBody.rotation.x -= Math.PI / 75;
                        self.jumperHead.rotation.x -= Math.PI / 75;

                        if (self.jumperBody.position.y > 0) {
                            self.jumperBody.position.y -= self.controls.HeightUnit / 20;
                            self.jumperHead.position.y -= self.controls.HeightUnit / 20;
                        }

                        self.renderer.render(self.scene, self.camera);

                        rotationHandler = requestAnimationFrame(act);
                    }else {
                        cancelAnimationFrame(rotationHandler);
                        self._jumperFallToTheGroundAfterRotation();
                    }
                    break;
            }
        }
    },

    _jumperFallToTheGroundAfterRotation: function(){

        var self = this;
        var FallToTheGround;

        act();

        function act() {

            if (self.jumperBody.position.y > 0){
                self.jumperBody.position.y -= self.controls.HeightUnit;
                self.jumperHead.position.y -= self.controls.HeightUnit;

                self.renderer.render(self.scene, self.camera);

                if (Math.abs(self.jumperBody.position.y - 0) < 0.05){
                    self.jumperBody.position.y = 0;
                    self.jumperHead.position.y = 0;
                }

                FallToTheGround = requestAnimationFrame(act);
            }else {
                cancelAnimationFrame(FallToTheGround);
            }
        }
    },

    _jumperLand: function(){
        window.console.log("LAND");

        var self = this;

        self.score += 1;

        if(self.successCallback){
            self.successCallback(self.score);
        }
    },

    _jumperMove: function () {
        var self = this;
        var direction = self.jumperStatus.currentDirection;

        self.jumperBody.scale.y += 0.01;
        self.jumperHead.scale.y += 0.01;

        if(direction === Direction.Left){
            self.jumperBody.position.z -= self.controls.DistanceUnit;
            self.jumperHead.position.z -= self.controls.DistanceUnit;
        }else if(direction === Direction.Right){
            self.jumperBody.position.z += self.controls.DistanceUnit;
            self.jumperHead.position.z += self.controls.DistanceUnit;
        }else{
            self.jumperBody.position.x += self.controls.DistanceUnit;
            self.jumperHead.position.x += self.controls.DistanceUnit;
        }

        self.jumperBody.position.y += self.jumperStatus.potentialEnergy * self.controls.HeightUnit;
        self.jumperHead.position.y += self.jumperStatus.potentialEnergy * self.controls.HeightUnit;

        self.jumperStatus.potentialEnergy -= self.controls.PotentialEnergyUnit;
    },

    Restart: function(){
        window.console.log("Game Restart");

        window.location.reload();
    },

    GameOver: function(){
        var self = this;

        window.console.log("Game Over");
        window.console.log("Score: " + self.score);

        // window.console.log(self.failCallback);
        if(self.failCallback) {
            self.failCallback(self.score);
        }
    },

    SwitchStage: function(){
        this.jumperStatus.status = this.jumperStatus.status === 3? 0: this.jumperStatus.status + 1;
    },


};



