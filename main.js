var game = new Jump();

console.log("between Jump() and init");

game.init();
game.RestartHandler(restart);
game.SuccessHandler(success);
game.FailHandler(fail);

var scoreBoard = document.getElementById('final-cover');

var ButtonRestart = document.getElementById('restart');
ButtonRestart.addEventListener('click', restart);

function restart() {
    console.log('Restart Outside');
    scoreBoard.style.display = 'none';
    game.Restart();
}

function success(currentScore) {
    window.console.log('Success Outside');

    var content = document.getElementById('current-score');
    window.console.log(content);
    content.innerText = currentScore;
}

function fail(finalScore) {
    window.console.log('Fail Outside');

    scoreBoard.style.display = 'flex';
    var content = document.getElementById('final-score');
    content.innerText = finalScore;
}

