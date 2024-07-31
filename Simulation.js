var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("myCanvas"));
var c = canvas.getContext('2d');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;
var simMinWidth = 20;
var cScale = Math.min(canvas.width, canvas.height) / simMinWidth;
var simWidth = canvas.width / cScale;
var simHeight = canvas.height / cScale;

function cX(pos){
    return pos.x * cScale;
}

function cY(pos){
    return canvas.height - pos.y * cScale;
}

class vector2d {
    constructor(a,b){
        this.x = a;
        this.y = b;
    }
    
    add(a){
        let x = this.x + a.x;
        let y = this.y + a.y;
        return new vector2d(x,y);
    }

    sub(a){
        let x = this.x - a.x;
        let y = this.y - a.y;
        return new vector2d(x,y);
    }

    scale(a){
        return new vector2d(this.x*a, this.y*a);
    }

    mag(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    dot(a){
        return this.x*a.x + this.y*a.y;
    }
}

class Ball {
    constructor(rad, mass, pos = vector2d(0,0), vel = vector2d(0,0))
    {
        this.rad = rad;
        this.mass = mass;
        this.pos = pos;
        this.vel = vel;
    }

    simulate(dt, a){
        this.vel.y += a*dt;
        this.pos.x += this.vel.x*dt; 
        this.pos.y += this.vel.y*dt; 
    }
}

var PhysicsWorld = {
    dt: 1/60,
    substeps: 32,
    sdt: this.dt/this.substeps,
    WorldSize: [simWidth, simHeight],
    g: -9.83,
    e: 0.8, //coefficient of restitution
    balls: []
}

function gravitySwitch(){
    if(PhysicsWorld.g != 0){
        PhysicsWorld.g = 0;
    } else {PhysicsWorld.g = -9.83;}
}

function WorldSetup(){
    var NumberOfBalls = 300;
    var MinBallSize = 0.2;
    var MaxBallSize = 0.6;
    var MaxVelocity = 20;
    // var BallDensity = 1;
    var Allowed = true;
    PhysicsWorld.balls = [];

    while (PhysicsWorld.balls.length < NumberOfBalls){
        Allowed = true;
        var rad = MinBallSize + Math.random()*(MaxBallSize-MinBallSize);
        var mass = 4/3*Math.PI*Math.pow(rad, 3);

        pos = new vector2d(
            Math.random()*PhysicsWorld.WorldSize[0] - rad,
            Math.random()*PhysicsWorld.WorldSize[1] - rad
        )

        vel = new vector2d(
            Math.random()*MaxVelocity,
            Math.random()*MaxVelocity
        )

        if (PhysicsWorld.balls !== undefined){
            for (ball of PhysicsWorld.balls)
            {
                if (ball.pos.add(-pos).mag()>(ball.rad + rad)){
                    Allowed = false;
                } 
            }
        }
        if (Allowed){
            PhysicsWorld.balls.push(new Ball(rad, mass, pos, vel));
        }
    }
}

function HandleBallCollision(ball1, ball2){
    let r = ball2.pos.sub(ball1.pos);

    if (r.mag() == 0 || r.mag() > (ball1.rad + ball2.rad)){
        return;
    }

    if (r.mag() < (ball1.rad + ball2.rad)){
        let normal = r.scale(1.0/r.mag());
        let v1n = ball1.vel.dot(normal);
        let v2n = ball2.vel.dot(normal);

        corr = (ball1.rad + ball2.rad - r.mag())/2;
        ball1.pos = ball1.pos.add(normal.scale(-corr));
        ball2.pos = ball2.pos.add(normal.scale(corr));

        newv1 = (v1n*ball1.mass + v2n * ball2.mass - ball2.mass * (v1n - v2n) * PhysicsWorld.e) / (ball1.mass + ball2.mass);
        newv2 = (v1n*ball1.mass + v2n * ball2.mass - ball1.mass * (v2n - v1n) * PhysicsWorld.e) / (ball1.mass + ball2.mass);

        ball1.vel = ball1.vel.add(normal.scale(newv1 - v1n));
        ball2.vel = ball2.vel.add(normal.scale(newv2 - v2n));
    }    
}   

function HandleWallCollision(ball){
    let rad = ball.rad;
    let pos = ball.pos;
    let vel = ball.vel;

    if (pos.x < rad){
        ball.pos.x = 2*rad - rad;
        ball.vel.x = - vel.x*PhysicsWorld.e; 
    } else if (pos.x > simWidth - rad){
        ball.pos.x = 2*(simWidth - rad) - pos.x;
        ball.vel.x = - vel.x*PhysicsWorld.e; 
    }
    if (pos.y < rad){
        ball.pos.y = 2*rad - pos.y;
        ball.vel.y = - vel.y*PhysicsWorld.e; 
    } else if (pos.y > simHeight - rad){
        ball.pos.y = 2*(simHeight - rad) - pos.y;
        ball.vel.y = - vel.y*PhysicsWorld.e; 
    }
}

// drawing --------------
function draw(){
    c.clearRect(0,0,canvas.width, canvas.height);
    c.fillStyle = "#FF0000";

    for (const ball of PhysicsWorld.balls){
        c.beginPath();
        c.arc(cX(ball.pos), cY(ball.pos), ball.rad*cScale, 0, 2*Math.PI);
        c.fillStyle = 'rgb(' + Math.random*255 + ' ' + Math.random*255 + ' ' + Math.random*255 + ')'
        c.fill();
    }
}

// Simulate --------------
function simulate(){   
    for (var i=0; i<PhysicsWorld.balls.length; i++){
        let ball1 = PhysicsWorld.balls[i];
        ball1.simulate(PhysicsWorld.dt, PhysicsWorld.g);
        for(var j=i+1; j<PhysicsWorld.balls.length; j++){
            let ball2 = PhysicsWorld.balls[j];
            HandleBallCollision(ball1, ball2);
        }
        HandleWallCollision(ball1);
    }
   
}

// Updating --------------
function update(){
    simulate();
    draw();
    requestAnimationFrame(update);
}

WorldSetup();
update();
document.getElementById('restitutionSlider').oninput = function(){
    PhysicsWorld.e = this.value / 10;
}