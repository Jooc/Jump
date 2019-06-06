var game = new Jump();

console.log("between Jump() and init");

game.init();
game.RestartHandler(restart);
game.SuccessHandler(success);
game.FailHandler(fail);


function restart() {
    console.log('Restart Outside');
}

function success(currentScore) {
    window.console.log('Success Outside');

    var content = document.getElementsByClassName('content')[0];
    window.console.log(content[0]);
    content.innerHTML = "<h1>Score:" + currentScore + "</h1>";
}

function fail() {
    window.console.log('Fail Outside');
}

