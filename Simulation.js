var canvas = document.getElementById("myCanvas");
var c = canvas.getContext('2d')

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

var dt = 1/10;
var g = -9.83;

var ball = {
    radius: 0.2,
    pos: {x: 0.2, y:0.2},
    vel: {x:10, y:15}
}

var substeps = 32;
var ndt = dt/substeps;

// drawing --------------
function draw(){
    c.clearRect(0,0,canvas.width, canvas.height);
    c.fillStyle = "#FF0000";

    c.beginPath();
    c.arc(cX(ball.pos), cY(ball.pos), cScale * ball.radius, 0.0, 2.0 * Math.PI)
    c.fill();
}

// Simulate --------------
function simulate(){
    for (var i=0; i<substeps; i++)
    {
        ball.vel.y += g*ndt;
        ball.pos.x += ball.vel.x*ndt;
        ball.pos.y += ball.vel.y*ndt;

        if (ball.pos.x < 0.0){
        ball.pos.x = -ball.pos.x;
        ball.vel.x = -ball.vel.x;
        } else if (ball.pos.x > simWidth){
            ball.pos.x = 2*simWidth - ball.pos.x;
            ball.vel.x = -ball.vel.x;
        }
        if (ball.pos.y < 0){
            ball.pos.y = -ball.pos.y;
            ball.vel.y = -ball.vel.y; 
        } else if (ball.pos.y > simHeight){
            ball.pos.y = 2*simHeight - ball.pos.y;
            ball.vel.y = - ball.vel.y; 
        }
    }  
}

// Updating --------------
function update(){
    simulate();
    draw();
    requestAnimationFrame(update);
}

update();