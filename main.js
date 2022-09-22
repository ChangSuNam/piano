

document.addEventListener("DOMContentLoaded", function (event) {

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);
    var waveform = 'sine' //default is sine


    //change between sine and sawtooth with button
    document.getElementById("sineButton").onclick = function () {

        waveform = 'sine'
    }
    document.getElementById("sawtoothButton").onclick = function () {

        waveform = 'sawtooth'
    }

    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#z
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    const colors = ["black", "white", "green", "red", "orange", "salmon", "purple", "blue","yellow","green"]

    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);

    activeOscillators = {}
    activeGainNodes = {}

    function keyDown(event) {
        console.log("key down")
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            playNote(key);
            document.body.style.backgroundColor = colors[Math.floor(Math.random() * 9)]
        }
        
        
    
    }

    function keyUp(event) {
        console.log("key up")
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            //activeOscillators[key].stop();
            activeGainNodes[key].gain.cancelScheduledValues(audioCtx.currentTime)
            activeGainNodes[key].gain.setTargetAtTime(
                0,
                audioCtx.currentTime,
                0.02
            );
            activeOscillators[key].stop(audioCtx.currentTime + 0.05)
            delete activeOscillators[key];
            delete activeGainNodes[key];
        }
    }




    function playNote(key) {
        const osc = audioCtx.createOscillator()
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime)
        osc.type = waveform //choose your favorite waveform from the buttons
        //osc.connect(audioCtx.destination)
        var gainNode = audioCtx.createGain()
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
        osc.connect(gainNode).connect(audioCtx.destination) //you will need a new gain node for each node to control the adsr of that note
        osc.start();
        activeOscillators[key] = osc
        activeGainNodes[key] = gainNode




        let gainCount = Object.keys(activeGainNodes).length;
        // polyphony
        Object.keys(activeGainNodes).forEach(function (key) {
            activeGainNodes[key].gain.setTargetAtTime(
                0.5 / gainCount,
                audioCtx.currentTime,
                0.1
            ); // (target, startTime, timeConstant)
        });
        // decay and sustain
        gainNode.gain.setTargetAtTime(
            0.2 / gainCount,
            audioCtx.currentTime + 0.1,
            0.1
        );
    }

});