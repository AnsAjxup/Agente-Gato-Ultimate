var versionCode = "Alpha 0.9";
//alto y ancho del canvas
var ancho = 600;
var alto = 650;

var colores = {azulClaro: "rgb(173, 202, 255)", negro: "rgb(7, 5, 14)", azul: "rgb(36, 32, 95)", rojo: "rgb(129, 43, 56)"};

//la tabla es un array de arrays, donde cada array representa una tabla hija
var tablas = [

    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]

];

//este tablero se edita cuando gana una tabla hija
var tablaPrincipal = [0, 0, 0, 0, 0, 0, 0, 0, 0];

//se inicializan las posiciones del maus en 0 y el click en falso
var mousePosX = 0;
var mousePosY = 0;
var clicked = false;

//se obtiene el elemento canvas del html y se le pasa el contexto 2d
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var turnoActual = 1;
var jugador = 1;
var ai = -1;
var tablaActual = 4;

var juegoEnProceso = false;

var enJuego = 0;

var movimientos = 0;

var switchAroo = 1;

var AIACTIVE = true;

var nombreJugadores = ["JUGADOR", "AI"];

// FUNCIONES

// comprueba el tablero y devuelve 1 o -1 si un jugador específico ha ganado
//devuelve 0 si nadie ha ganado
function comprobarCondicionGanador(map) {
    var a = 1;
    if (map[0] + map[1] + map[2] === a * 3 || map[3] + map[4] + map[5] === a * 3 || map[6] + map[7] + map[8] === a * 3 || map[0] + map[3] + map[6] === a * 3 || map[1] + map[4] + map[7] === a * 3 ||
        map[2] + map[5] + map[8] === a * 3 || map[0] + map[4] + map[8] === a * 3 || map[2] + map[4] + map[6] === a * 3) {
        return a;
    }
    a = -1;
    if (map[0] + map[1] + map[2] === a * 3 || map[3] + map[4] + map[5] === a * 3 || map[6] + map[7] + map[8] === a * 3 || map[0] + map[3] + map[6] === a * 3 || map[1] + map[4] + map[7] === a * 3 ||
        map[2] + map[5] + map[8] === a * 3 || map[0] + map[4] + map[8] === a * 3 || map[2] + map[4] + map[6] === a * 3) {
        return a;
    }
    return 0;
}

//esta funcion evalua el estado actual del juego
function evaluarJuego(posicion, tableroActual) {
    var evaluar = 0;
    var mainBd = [];
    var evaluatorMul = [1.4, 1, 1.4, 1, 1.75, 1, 1.4, 1, 1.4];
    for (var eh = 0; eh < 9; eh++){
        evaluar += evaluacionRealCasilla(posicion[eh])*1.5*evaluatorMul[eh];
        if(eh === tableroActual){
            evaluar += evaluacionRealCasilla(posicion[eh])*evaluatorMul[eh];
        }
        var tmpEv = comprobarCondicionGanador(posicion[eh]);
        evaluar -= tmpEv*evaluatorMul[eh];
        mainBd.push(tmpEv);
    }
    evaluar -= comprobarCondicionGanador(mainBd)*5000;
    evaluar += evaluacionRealCasilla(mainBd)*150;
    return evaluar;
}

//algoritmo minimax
function miniMax(posicion, tableroAJugar, profundidad, alpha, beta, jugadorMaximizador) {
    enJuego++;

    var tmpPlay = -1;

    var calcEval = evaluarJuego(posicion, tableroAJugar);
    if(profundidad <= 0 || Math.abs(calcEval) > 5000) {
        return {"mE": calcEval, "tP": tmpPlay};
    }
    //Si el tablero para jugar es -1, significa que puedes jugar en cualquier tablero.
    if(tableroAJugar !== -1 && comprobarCondicionGanador(posicion[tableroAJugar]) !== 0){
        tableroAJugar = -1;
    }
    //Si un tablero está lleno (no incluye 0), también configura el tablero para jugar en -1
    if(tableroAJugar !== -1 && !posicion[tableroAJugar].includes(0)){
        tableroAJugar = -1;
    }

    if(jugadorMaximizador){
        var maxEval = -Infinity;
        for(var mm = 0; mm < 9; mm++){
            var evalut = -Infinity;
            //puedes jugar en cualquier tablero, tienes que pasar por todos
            if(tableroAJugar === -1){
                for(var trr = 0; trr < 9; trr++){
                    //Excepto los que se ganan
                    if(comprobarCondicionGanador(posicion[mm]) === 0){
                        if(posicion[mm][trr] === 0){
                            posicion[mm][trr] = ai;
                            //tmpPlay = pickBoard(position, true);
                            evalut = miniMax(posicion, trr, profundidad-1, alpha, beta, false).mE;
                            //evalut+=150;
                            posicion[mm][trr] = 0;
                        }
                        if(evalut > maxEval){
                            maxEval = evalut;
                            tmpPlay = mm;
                        }
                        alpha = Math.max(alpha, evalut);
                    }

                }
                if(beta <= alpha){
                    break;
                }
            //Si hay un tablero específico para jugar, solo pasa por sus cuadrados
            }else{
                if(posicion[tableroAJugar][mm] === 0){
                    posicion[tableroAJugar][mm] = ai;
                    evalut = miniMax(posicion, mm, profundidad-1, alpha, beta, false);
                    posicion[tableroAJugar][mm] = 0;
                }
                var blop = evalut.mE;
                if(blop > maxEval){
                    maxEval = blop;
                    //Guarda en qué tablero deberías jugar, para que esto pueda transmitirse cuando la IA pueda jugar en cualquier tablero
                    tmpPlay = evalut.tP;
                }
                alpha = Math.max(alpha, blop);
                if(beta <= alpha){
                    break;
                }
            }
        }
        return {"mE": maxEval, "tP": tmpPlay};
    }else{
        //se realiza lo mismo para el extremo minimizador
        var minEval = Infinity;
        for(var mm = 0; mm < 9; mm++){
            var evalua = Infinity;
            if(tableroAJugar === -1){
                for(var trr = 0; trr < 9; trr++){
                    if(comprobarCondicionGanador(posicion[mm]) === 0){
                        if(posicion[mm][trr] === 0){
                            posicion[mm][trr] = jugador;
                            //tmpPlay = pickBoard(position, true);
                            evalua = miniMax(posicion, trr, profundidad-1, alpha, beta, true).mE;
                            //evalua -= 150;
                            posicion[mm][trr] = 0;
                        }
                        if(evalua < minEval){
                            minEval = evalua;
                            tmpPlay = mm;
                        }
                        beta = Math.min(beta, evalua);
                    }

                }
                if(beta <= alpha){
                    break;
                }
            }else{
                if(posicion[tableroAJugar][mm] === 0){
                    posicion[tableroAJugar][mm] = jugador;
                    evalua = miniMax(posicion, mm, profundidad-1, alpha, beta, true);
                    posicion[tableroAJugar][mm] = 0;
                }
                var blep = evalua.mE;
                if(blep < minEval){
                    minEval = blep;
                    tmpPlay = evalua.tP;
                }
                beta = Math.min(beta, blep);
                if(beta <= alpha){
                    break;
                }
            }
        }
        return {"mE": minEval, "tP": tmpPlay};
    }
}

//Número bajo significa perder el tablero, número grande significa ganar
//esta funcion ayuda a la IA a evalura movimiento para ganar un tablero normal
function evaluacionPos(pos, casilla){
    pos[casilla] = ai;
    var evaluacion = 0;
    //Prefiere el centro sobre las esquinas sobre los bordes
    //erealiza la evaluacion -= (pos[0]*0.2+pos[1]*0.1+pos[2]*0.2+pos[3]*0.1+pos[4]*0.25+pos[5]*0.1+pos[6]*0.2+pos[7]*0.1+pos[8]*0.2);
    var puntos = [0.2, 0.17, 0.2, 0.17, 0.22, 0.17, 0.2, 0.17, 0.2];

    var a = 2;
    evaluacion+=puntos[casilla];
    //console.log("Eyy");
    a = -2;
    if(pos[0] + pos[1] + pos[2] === a || pos[3] + pos[4] + pos[5] === a || pos[6] + pos[7] + pos[8] === a || pos[0] + pos[3] + pos[6] === a || pos[1] + pos[4] + pos[7] === a ||
        pos[2] + pos[5] + pos[8] === a || pos[0] + pos[4] + pos[8] === a || pos[2] + pos[4] + pos[6] === a) {
        evaluacion += 1;
    }
    //victorias
    a = -3;
    if(pos[0] + pos[1] + pos[2] === a || pos[3] + pos[4] + pos[5] === a || pos[6] + pos[7] + pos[8] === a || pos[0] + pos[3] + pos[6] === a || pos[1] + pos[4] + pos[7] === a ||
        pos[2] + pos[5] + pos[8] === a || pos[0] + pos[4] + pos[8] === a || pos[2] + pos[4] + pos[6] === a) {
        evaluacion += 5;
    }

    //Bloquear el turno de un jugador si es necesario
    pos[casilla] = jugador;

    a = 3;
    if(pos[0] + pos[1] + pos[2] === a || pos[3] + pos[4] + pos[5] === a || pos[6] + pos[7] + pos[8] === a || pos[0] + pos[3] + pos[6] === a || pos[1] + pos[4] + pos[7] === a ||
        pos[2] + pos[5] + pos[8] === a || pos[0] + pos[4] + pos[8] === a || pos[2] + pos[4] + pos[6] === a) {
        evaluacion += 2;
    }

    pos[casilla] = ai;

    evaluacion-=comprobarCondicionGanador(pos)*15;

    pos[casilla] = 0;

    return evaluacion;
}

//Esta función evalúa una tabla de manera justa
function evaluacionRealCasilla(pos){
    var evaluacion = 0;
    var puntos = [0.2, 0.17, 0.2, 0.17, 0.22, 0.17, 0.2, 0.17, 0.2];

    for(var bw in pos){
        evaluacion -= pos[bw]*puntos[bw];
    }

    var a = 2;
    if(pos[0] + pos[1] + pos[2] === a || pos[3] + pos[4] + pos[5] === a || pos[6] + pos[7] + pos[8] === a) {
        evaluacion -= 6;
    }
    if(pos[0] + pos[3] + pos[6] === a || pos[1] + pos[4] + pos[7] === a || pos[2] + pos[5] + pos[8] === a) {
        evaluacion -= 6;
    }
    if(pos[0] + pos[4] + pos[8] === a || pos[2] + pos[4] + pos[6] === a) {
        evaluacion -= 7;
    }

    a = -1;
    if((pos[0] + pos[1] === 2*a && pos[2] === -a) || (pos[1] + pos[2] === 2*a && pos[0] === -a) || (pos[0] + pos[2] === 2*a && pos[1] === -a)
        || (pos[3] + pos[4] === 2*a && pos[5] === -a) || (pos[3] + pos[5] === 2*a && pos[4] === -a) || (pos[5] + pos[4] === 2*a && pos[3] === -a)
        || (pos[6] + pos[7] === 2*a && pos[8] === -a) || (pos[6] + pos[8] === 2*a && pos[7] === -a) || (pos[7] + pos[8] === 2*a && pos[6] === -a)
        || (pos[0] + pos[3] === 2*a && pos[6] === -a) || (pos[0] + pos[6] === 2*a && pos[3] === -a) || (pos[3] + pos[6] === 2*a && pos[0] === -a)
        || (pos[1] + pos[4] === 2*a && pos[7] === -a) || (pos[1] + pos[7] === 2*a && pos[4] === -a) || (pos[4] + pos[7] === 2*a && pos[1] === -a)
        || (pos[2] + pos[5] === 2*a && pos[8] === -a) || (pos[2] + pos[8] === 2*a && pos[5] === -a) || (pos[5] + pos[8] === 2*a && pos[2] === -a)
        || (pos[0] + pos[4] === 2*a && pos[8] === -a) || (pos[0] + pos[8] === 2*a && pos[4] === -a) || (pos[4] + pos[8] === 2*a && pos[0] === -a)
        || (pos[2] + pos[4] === 2*a && pos[6] === -a) || (pos[2] + pos[6] === 2*a && pos[4] === -a) || (pos[4] + pos[6] === 2*a && pos[2] === -a)){
        evaluacion-=9;
    }

    a = -2;
    if(pos[0] + pos[1] + pos[2] === a || pos[3] + pos[4] + pos[5] === a || pos[6] + pos[7] + pos[8] === a) {
        evaluacion += 6;
    }
    if(pos[0] + pos[3] + pos[6] === a || pos[1] + pos[4] + pos[7] === a || pos[2] + pos[5] + pos[8] === a) {
        evaluacion += 6;
    }
    if(pos[0] + pos[4] + pos[8] === a || pos[2] + pos[4] + pos[6] === a) {
        evaluacion += 7;
    }

    a = 1;
    if((pos[0] + pos[1] === 2*a && pos[2] === -a) || (pos[1] + pos[2] === 2*a && pos[0] === -a) || (pos[0] + pos[2] === 2*a && pos[1] === -a)
        || (pos[3] + pos[4] === 2*a && pos[5] === -a) || (pos[3] + pos[5] === 2*a && pos[4] === -a) || (pos[5] + pos[4] === 2*a && pos[3] === -a)
        || (pos[6] + pos[7] === 2*a && pos[8] === -a) || (pos[6] + pos[8] === 2*a && pos[7] === -a) || (pos[7] + pos[8] === 2*a && pos[6] === -a)
        || (pos[0] + pos[3] === 2*a && pos[6] === -a) || (pos[0] + pos[6] === 2*a && pos[3] === -a) || (pos[3] + pos[6] === 2*a && pos[0] === -a)
        || (pos[1] + pos[4] === 2*a && pos[7] === -a) || (pos[1] + pos[7] === 2*a && pos[4] === -a) || (pos[4] + pos[7] === 2*a && pos[1] === -a)
        || (pos[2] + pos[5] === 2*a && pos[8] === -a) || (pos[2] + pos[8] === 2*a && pos[5] === -a) || (pos[5] + pos[8] === 2*a && pos[2] === -a)
        || (pos[0] + pos[4] === 2*a && pos[8] === -a) || (pos[0] + pos[8] === 2*a && pos[4] === -a) || (pos[4] + pos[8] === 2*a && pos[0] === -a)
        || (pos[2] + pos[4] === 2*a && pos[6] === -a) || (pos[2] + pos[6] === 2*a && pos[4] === -a) || (pos[4] + pos[6] === 2*a && pos[2] === -a)){
        evaluacion+=9;
    }

    evaluacion -= comprobarCondicionGanador(pos)*12;

    return evaluacion;
}

//función para devolver el signo de un número.
function signo(x){
    if(x > 0){
        return 1;
    }else if(x < 0){
        return -1;
    }else{
        return 0;
    }
}

// FUNCION DE JUEGO

var mejorMovimiento = -1;
var mejorPuntuacion = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

function juego(){
    //pinta la tabla principal
    ctx.fillStyle = colores.azulClaro;
    ctx.fillRect(0, 0, ancho, alto);

    ctx.lineWidth = 3;
    var tamañoCasilla = ancho/4;

    //manejo de IA

    if(turnoActual === -1 && juegoEnProceso && AIACTIVE){

        console.log("inica turno AI");
        //document.getElementById("loader").removeAttribute('hidden');

        mejorMovimiento = -1;
        mejorPuntuacion = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity, -Infinity];

        enJuego = 0; //almacena la cantidad de ejecuciones de minimax

        //calcula la cantidad restante de cuadrados vacíos
        var cuenta = 0;
        for(var bt = 0; bt < tablas.length; bt++){
            if(comprobarCondicionGanador(tablas[bt]) === 0){
                tablas[bt].forEach((v) => (v === 0 && cuenta++));
            }
        }


        if(tablaActual === -1 || comprobarCondicionGanador(tablas[tablaActual]) !== 0){
            var guardarMm;

            console.log("restante: " + cuenta);

            //minimax determina en qué tablero debes jugar
            if(movimientos < 10) {
                guardarMm = miniMax(tablas, -1, Math.min(4, cuenta), -Infinity, Infinity, true); //math.min asegura que minimax no se ejecute cuando el tablero esté lleno
            }else if(movimientos < 18){
                guardarMm = miniMax(tablas, -1, Math.min(5, cuenta), -Infinity, Infinity, true);
            }else{
                guardarMm = miniMax(tablas, -1, Math.min(6, cuenta), -Infinity, Infinity, true);
            }
            console.log(guardarMm.tP);
            tablaActual = guardarMm.tP;
        }

        //hace un movimiento predeterminado rápido por si todo lo demás falla
        for (var i = 0; i < 9; i++) {
            if (tablas[tablaActual][i] === 0) {
                mejorMovimiento = i;
                break;
            }
        }


        if(mejorMovimiento !== -1) { //Esta condición solo debería ser falsa si el tablero está lleno

            //El mejor puntaje es una matriz que contiene puntajes individuales para cada cuadrado, aquí solo los
            //estamos cambiando en función de qué tan bueno es el movimiento en ese tablero local
            for (var a = 0; a < 9; a++) {
                if (tablas[tablaActual][a] === 0) {
                    var score = evaluacionPos(tablas[tablaActual], a, turnoActual)*45;
                    mejorPuntuacion[a] = score;
                }
            }

            //ejecutamos minimax y agregamos esos valores a la matriz
            for(var b = 0; b < 9; b++){
                if(comprobarCondicionGanador(tablas[tablaActual]) === 0){
                    if (tablas[tablaActual][b] === 0) {
                        tablas[tablaActual][b] = ai;
                        var guardarMm;
                        if(movimientos < 20){
                            guardarMm = miniMax(tablas, b, Math.min(5, cuenta), -Infinity, Infinity, false);
                        }else if(movimientos < 32){
                            console.log("DEEP SEARCH");
                            guardarMm = miniMax(tablas, b, Math.min(6, cuenta), -Infinity, Infinity, false);
                        }else{
                            console.log("ULTRA DEEP SEARCH");
                            guardarMm = miniMax(tablas, b, Math.min(7, cuenta), -Infinity, Infinity, false);
                        }
                        console.log(guardarMm);
                        var score2 = guardarMm.mE;
                        tablas[tablaActual][b] = 0;
                        mejorPuntuacion[b] += score2;
                        //boardSel[b] = savedMm.tP;
                        //console.log(score2);
                    }
                }
            }

            console.log(mejorPuntuacion);

            //Elige jugar en el cuadrado con la evaluación más alta en la matriz bestScore
            for(var i in mejorPuntuacion){
                if(mejorPuntuacion[i] > mejorPuntuacion[mejorMovimiento]){
                    mejorMovimiento = i;
                }
            }

            //coloca la cruz/cero
            if(tablas[tablaActual][mejorMovimiento] === 0){
                tablas[tablaActual][mejorMovimiento] = ai;
                tablaActual = mejorMovimiento;
            }

            console.log(evaluarJuego(tablas, tablaActual));
        }

        //document.getElementById("loader").setAttribute('hidden', 'hidden');

        turnoActual = -turnoActual;

    }

    tamañoForma = tamañoCasilla/6;

    //controlador del click del maus
    if(clicked === true && juegoEnProceso) {
        for (var i in tablas) {
            if(tablaActual !== -1){i = tablaActual;if(tablaPrincipal[tablaActual] !== 0){continue;}}
            for (var j in tablas[i]) {
                if(tablas[i][j] === 0) {
                    if (mousePosX > (ancho / 3 - tamañoCasilla) / 2 + tamañoCasilla / 6 - tamañoForma + (j % 3) * tamañoCasilla / 3 + (i % 3) * ancho / 3 && mousePosX < (ancho / 3 - tamañoCasilla) / 2 + tamañoCasilla / 6 + tamañoForma + (j % 3) * tamañoCasilla / 3 + (i % 3) * ancho / 3) {
                        if (mousePosY > (ancho / 3 - tamañoCasilla) / 2 + tamañoCasilla / 6 - tamañoForma + Math.floor(j / 3) * tamañoCasilla / 3 + Math.floor(i / 3) * ancho / 3 && mousePosY < (ancho / 3 - tamañoCasilla) / 2 + tamañoCasilla / 6 + tamañoForma + Math.floor(j / 3) * tamañoCasilla / 3 + Math.floor(i / 3) * ancho / 3) {
                            tablas[i][j] = turnoActual;
                            tablaActual = j;
                            turnoActual = -turnoActual;
                            movimientos++;
                            break;
                        }
                    }
                }
            }
        }
    }

    //dibujar tableros

    tamañoCasilla = ancho/4;
    var tamañoForma = ancho/36;

    ctx.strokeStyle = colores.negro;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ancho/3, 0);
    ctx.lineTo(ancho/3, ancho);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ancho/3*2, 0);
    ctx.lineTo(ancho/3*2, ancho);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, ancho/3);
    ctx.lineTo(ancho, ancho/3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, ancho/3*2);
    ctx.lineTo(ancho, ancho/3*2);
    ctx.stroke();

    ctx.lineWidth = 3;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            ctx.beginPath();
            ctx.moveTo(i*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla/3, j*ancho/3 + (ancho/3 - tamañoCasilla)/2);
            ctx.lineTo(i*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla/3, j*ancho/3 + (ancho/3 - tamañoCasilla)/2 + tamañoCasilla);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla*2/3, j*ancho/3 + (ancho/3 - tamañoCasilla)/2);
            ctx.lineTo(i*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla*2/3, j*ancho/3 + (ancho/3 - tamañoCasilla)/2 + tamañoCasilla);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i*ancho/3 + (ancho/3 - tamañoCasilla)/2, j*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla/3);
            ctx.lineTo(i*ancho/3 + (ancho/3 - tamañoCasilla)/2 + tamañoCasilla, j*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla/3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(i*ancho/3 + (ancho/3 - tamañoCasilla)/2, j*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla*2/3);
            ctx.lineTo(i*ancho/3 + (ancho/3 - tamañoCasilla)/2 + tamañoCasilla, j*ancho/3 + (ancho/3-tamañoCasilla)/2 + tamañoCasilla*2/3);
            ctx.stroke();
        }
    }

    //dibujar los X/O
    ctx.lineWidth = 5;

    for(var i in tablas){
        if(tablaPrincipal[i] === 0) {
            if (comprobarCondicionGanador(tablas[i]) !== 0) {
                tablaPrincipal[i] = comprobarCondicionGanador(tablas[i]);
            }
        }
        for(var j in tablas[i]){
            if(tablas[i][j] === 1*switchAroo){
                ctx.strokeStyle = colores.rojo;
                ctx.beginPath();
                ctx.moveTo((ancho/3-tamañoCasilla)/2 + tamañoCasilla/6 - tamañoForma + (j%3)*tamañoCasilla/3 + (i%3)*ancho/3, (ancho/3 - tamañoCasilla)/2 + tamañoCasilla/6 - tamañoForma + Math.floor(j/3)*tamañoCasilla/3 + Math.floor(i/3)*ancho/3);
                ctx.lineTo((ancho/3-tamañoCasilla)/2 + tamañoCasilla/6 + tamañoForma + (j%3)*tamañoCasilla/3 + (i%3)*ancho/3, (ancho/3 - tamañoCasilla)/2 + tamañoCasilla/6 + tamañoForma + Math.floor(j/3)*tamañoCasilla/3 + Math.floor(i/3)*ancho/3);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo((ancho/3-tamañoCasilla)/2 + tamañoCasilla/6 - tamañoForma + (j%3)*tamañoCasilla/3 + (i%3)*ancho/3, (ancho/3 - tamañoCasilla)/2 + tamañoCasilla/6 + tamañoForma + Math.floor(j/3)*tamañoCasilla/3 + Math.floor(i/3)*ancho/3);
                ctx.lineTo((ancho/3-tamañoCasilla)/2 + tamañoCasilla/6 + tamañoForma + (j%3)*tamañoCasilla/3 + (i%3)*ancho/3, (ancho/3 - tamañoCasilla)/2 + tamañoCasilla/6 - tamañoForma + Math.floor(j/3)*tamañoCasilla/3 + Math.floor(i/3)*ancho/3);
                ctx.stroke();
            }else if(tablas[i][j] === -1*switchAroo){
                ctx.strokeStyle = colores.azul;
                ctx.beginPath();
                ctx.ellipse((ancho/3-tamañoCasilla)/2 + tamañoCasilla/6 + (j%3)*tamañoCasilla/3 + (i%3)*ancho/3, (ancho/3 - tamañoCasilla)/2 + tamañoCasilla/6 + Math.floor(j/3)*tamañoCasilla/3 + Math.floor(i/3)*ancho/3, tamañoForma*1.1, tamañoForma*1.1, 0, 0, Math.PI*2);
                ctx.stroke();
            }
        }
    }

    //Comprueba las condiciones de victoria
    if(juegoEnProceso){
        if (comprobarCondicionGanador(tablaPrincipal) !== 0) {
            juegoEnProceso = false;
            document.getElementById("winMenu").removeAttribute("hidden");
            if(comprobarCondicionGanador(tablaPrincipal) === 1){
                document.getElementById("result").innerHTML = nombreJugadores[0] + " A GANADO!";
            }else{
                document.getElementById("result").innerHTML = nombreJugadores[1] + " A GANADO!";
            }
        }

        //cuente la cantidad de casillas jugables, si es 0, el juego está empatado
        var cuentatw = 0;
        for(var bt = 0; bt < tablas.length; bt++){
            if(comprobarCondicionGanador(tablas[bt]) === 0){
                tablas[bt].forEach((v) => (v === 0 && cuentatw++));
            }
        }

        if(cuentatw === 0){
            juegoEnProceso = false;
            document.getElementById("winMenu").removeAttribute("hidden");
            document.getElementById("result").innerHTML = "ES UN EMPATE!!!";
        }
    }

    tamañoForma = tamañoCasilla/3;
    ctx.lineWidth = 20;

    //Dibuja los GRANDES ceros y cruces cuando se gana un tablero pequeño
    for(var j in tablaPrincipal){
        if(tablaPrincipal[j] === 1*switchAroo){
            ctx.strokeStyle = colores.rojo;
            ctx.beginPath();
            ctx.moveTo(ancho/6 - tamañoForma + (j%3)*ancho/3, ancho/6 - tamañoForma + Math.floor(j/3)*ancho/3);
            ctx.lineTo(ancho/6 + tamañoForma + (j%3)*ancho/3, ancho/6 + tamañoForma + Math.floor(j/3)*ancho/3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(ancho/6 - tamañoForma + (j%3)*ancho/3, ancho/6 + tamañoForma + Math.floor(j/3)*ancho/3);
            ctx.lineTo(ancho/6 + tamañoForma + (j%3)*ancho/3, ancho/6 - tamañoForma + Math.floor(j/3)*ancho/3);
            ctx.stroke();
        }else if(tablaPrincipal[j] === -1*switchAroo){
            ctx.strokeStyle = colores.azul;
            ctx.beginPath();
            ctx.ellipse(ancho/6 + (j%3)*ancho/3, ancho/6 + Math.floor(j/3)*ancho/3, tamañoForma*1.1, tamañoForma*1.1, 0, 0, Math.PI*2);
            ctx.stroke();
        }
    }

    if(tablaPrincipal[tablaActual] !== 0 || !tablas[tablaActual].includes(0)){tablaActual = -1;}

    //Destacar tablero para jugar

    ctx.fillStyle = colores.rojo;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(ancho/3*(tablaActual%3), ancho/3*Math.floor(tablaActual/3), ancho/3, ancho/3);
    ctx.globalAlpha = 1;

    //dibuja la barra de evalucacion/barra de progreso

    ctx.globalAlpha = 0.9;
    if(evaluarJuego(tablas, tablaActual)*switchAroo > 0){
        ctx.fillStyle = colores.azul;
    }else{
        ctx.fillStyle = colores.rojo;
    }
    ctx.fillRect(ancho/2, ancho, evaluarJuego(tablas, tablaActual)*2*switchAroo, alto/16);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(ancho/2, ancho);
    ctx.lineTo(ancho/2, ancho+alto);
    ctx.stroke();

    //console.log(RUNS);

    if(AIACTIVE){
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = colores.negro;
        ctx.fillRect(ancho/2, ancho, mejorPuntuacion[mejorMovimiento]*2*switchAroo, alto/16);
        ctx.globalAlpha = 1;
    }

    clicked = false;

}

// FUNCION DE RESET

var llaves;

// KEY LISTENERS

function coordenadaPantalla(eventoMouse)
{
    var rect = canvas.getBoundingClientRect();
    mousePosX = eventoMouse.clientX - rect.left;
    mousePosY = eventoMouse.clientY - rect.top;
}

function click(){
    clicked = true;
    //console.log("Eval: " + evaluatePosition(boards));
}
document.getElementById("myCanvas").onmousemove = coordenadaPantalla;
document.getElementById("myCanvas").onclick = click;

window.addEventListener('keydown', function (e) {
    llaves = (llaves || []);
    llaves[e.keyCode] = (e.type == "keydown");

    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }

}, false);
window.addEventListener('keyup', function (e) {
    llaves[e.keyCode] = (e.type == "keydown");
}, false);

// FUNCION DE RECARGA

function recargar() {
    localStorage.setItem("HighScoreBusiness", 0);
    //localStorage.clear();
}

function empezarJuego(tipo){
    tablas = [

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]

    ];

    tablaPrincipal = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    movimientos = 0;

    //currentTurn = 1;
    tablaActual = -1;

    if(tipo === 0){
        AIACTIVE = true;
        juegoEnProceso = true;
        nombreJugadores[0] = "JUGADOR";
        nombreJugadores[1] = "AI";
    }else{
        AIACTIVE = false;
        juegoEnProceso = true;
        switchAroo = 1;
        nombreJugadores[0] = "JUGADOR 1";
        nombreJugadores[1] = "JUGADOR 2";
    }
    document.getElementById("startMenu").setAttribute("hidden", "hidden");
    document.getElementById("turnMenu").setAttribute("hidden", "hidden");
}

function establecerJuego(tipo){
    if(tipo === 0){
        turnoActual = 1;
        switchAroo = 1;
    }else{
        turnoActual = -1;
        switchAroo = -1;
    }
    empezarJuego(0);
}
//FUNCION PARA MOSTRAR EL MENU
function menu(){
    document.getElementById("startMenu").removeAttribute("hidden");
    document.getElementById("turnMenu").setAttribute("hidden", "hidden");
    document.getElementById("winMenu").setAttribute("hidden", "hidden");
}
//FUNCION PARA MOSTRAR LOS TURNOS
function elegirTurno(){
    document.getElementById("startMenu").setAttribute("hidden", "hidden");
    document.getElementById("turnMenu").removeAttribute("hidden");
}

// BUCLE DEL JUEGO
function repetirJuego() {
    juego();
    requestAnimationFrame(repetirJuego);
}
requestAnimationFrame(repetirJuego);