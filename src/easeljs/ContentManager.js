//-----------------------------------------------------------------------------
// ContentManager.js
//
// Inspired by the Microsoft XNA Community Game Platformer Sample
// Copyright (C) Microsoft Corporation. All rights reserved.
// Ported to HTML5 Canvas with EaselJS by David Rousset - http://blogs.msdn.com/davrous
//-----------------------------------------------------------------------------

// Used to download all needed resources from our
// webserver
function ContentManager(stage, width, height) {
    // Method called back once all elements
    // have been downloaded
    var ondownloadcompleted;
    // Number of elements to download
    var NUM_ELEMENTS_TO_DOWNLOAD = 29;
    var numElementsLoaded = 0;

    var canPlayMp3;
    var canPlayOgg;

    var downloadProgress;

    // Need to check the canPlayType first or an exception
    // will be thrown for those browsers that don't support it      
    var myAudio = document.createElement('audio');

    if (myAudio.canPlayType) {
        // Currently canPlayType(type) returns: "", "maybe" or "probably" 
        canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
        canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
    }

    // setting the callback method
    // Triggered once everything is ready to be drawned on the canvas
    this.SetDownloadCompleted = function (callbackMethod) {
        ondownloadcompleted = callbackMethod;
    };

    // All the Images & Sounds of our game
    this.imgMonsterA = new Image();
    this.imgMonsterB = new Image(); 
    this.imgMonsterC = new Image(); 
    this.imgMonsterD = new Image();
    this.imgMonsterE = new Image();
    this.imgMonsterF = new Image();
    this.imgMonsterL = new Image();
    this.imgMonsterH = new Image();
    this.imgBlockA1 = new Image();
    this.imgBlockA2 = new Image();
    this.imgBlockA3 = new Image();
    this.imgBlockB1 = new Image();
    this.imgBlockB2 = new Image();
    this.imgBlockB3 = new Image();

    this.imgBlockLT = new Image();
    this.imgBlockCT = new Image();
    this.imgBlockRT = new Image();

    this.imgBlockLF = new Image();
    this.imgBlockCF = new Image();
    this.imgBlockRF = new Image();

    this.imgExit1 = new Image();
    this.imgExit2 = new Image();
    this.imgExit3 = new Image();
    this.imgPlatform1 = new Image();
    this.imgPlatform2 = new Image();
    this.imgPlatform3 = new Image();
    this.imgRobot = new Array(
        new Image(),
        new Image(),
        new Image(),
        new Image(),
        new Image()
    );
    this.imgBullet = new Array(
        new Image(),
        new Image(),
        new Image()
    );
    this.imgGem = new Image();
    this.winOverlay = new Image();
    this.loseOverlay = new Image();
    this.diedOverlay = new Image();
    this.globalMusic = new Audio();
    this.startLavel = new Audio();
    this.playerKilled = new Audio();
    this.playerJump = new Audio();
    this.playerFall = new Audio();
    this.playerFire = new Audio();
    this.playerFireNo = new Audio();
    this.exitReached = new Audio();
    this.gemCollected = [];

    // the background can be created with 3 differents layers
    // those 3 layers exist in 3 versions
    this.imgBackgroundLayers = new Array();

    // public method to launch the download process
    this.StartDownload = function () {
        // add a text object to output the current donwload progression
        downloadProgress = new Text("-- %", "bold 14px Arial", "#FFF");
        downloadProgress.x = (width / 2) - 50;
        downloadProgress.y = height / 2;
        stage.addChild(downloadProgress);

        var audioExtension = ".none";
        
        if (canPlayMp3)
            audioExtension = ".mp3";
        else if (canPlayOgg) {
            audioExtension = ".mp3";
        }

        // If the browser supports either MP3 or OGG
        if (audioExtension !== ".none") {
            SetAudioDownloadParameters(this.globalMusic, "sounds/Music" + audioExtension);
            SetAudioDownloadParameters(this.startLavel, "sounds/StartLavel" + audioExtension);
            SetAudioDownloadParameters(this.playerKilled, "sounds/PlayerKilled" + audioExtension);
            SetAudioDownloadParameters(this.playerJump, "sounds/Jump" + audioExtension);
            SetAudioDownloadParameters(this.playerFall, "sounds/PlayerFall" + audioExtension);
            SetAudioDownloadParameters(this.playerFire, "sounds/PlayerFire" + audioExtension);
            SetAudioDownloadParameters(this.playerFireNo, "sounds/PlayerFireNo" + audioExtension);
            SetAudioDownloadParameters(this.exitReached, "sounds/ExitReached" + audioExtension);
                // Used to simulate multi-channels audio 
                // As HTML5 Audio in browsers is today too limited
                // Yes, I know, we're forced to download N times to same file...
                for (var a = 0; a < 8; a++) {
                    this.gemCollected[a] = new Audio();
                    SetAudioDownloadParameters(this.gemCollected[a], "sounds/GemCollected" + audioExtension);
                }
        }

        // download the 3 layers * 3 versions
        for (var i = 0; i < 3; i++) {
            this.imgBackgroundLayers[i] = new Image();
            SetDownloadParameters(this.imgBackgroundLayers[i], "img/Backgrounds/Layer" + i + ".png");

        }

        SetDownloadParameters(this.imgRobot[0], "img/Robot0.png");
        SetDownloadParameters(this.imgRobot[1], "img/Robot1.png");
        SetDownloadParameters(this.imgRobot[2], "img/Robot2.png");
        SetDownloadParameters(this.imgRobot[3], "img/Robot3.png");
        SetDownloadParameters(this.imgRobot[4], "img/Robot4.png");

        SetDownloadParameters(this.imgBullet[0], "img/Bullet0.png");
        SetDownloadParameters(this.imgBullet[1], "img/Bullet1.png");
        SetDownloadParameters(this.imgBullet[2], "img/Bullet2.png");

        SetDownloadParameters(this.imgMonsterA, "img/MonsterA.png");
        SetDownloadParameters(this.imgMonsterB, "img/MonsterB.png");
        SetDownloadParameters(this.imgMonsterC, "img/MonsterC.png");
        SetDownloadParameters(this.imgMonsterD, "img/MonsterD.png");
        SetDownloadParameters(this.imgMonsterE, "img/MonsterE.png");
        SetDownloadParameters(this.imgMonsterF, "img/MonsterF.png");
        SetDownloadParameters(this.imgMonsterL, "img/MonsterL.png");
        SetDownloadParameters(this.imgMonsterH, "img/MonsterH.png");

        SetDownloadParameters(this.winOverlay, "overlays/you_win.png");
        SetDownloadParameters(this.loseOverlay, "overlays/you_lose.png");
        SetDownloadParameters(this.diedOverlay, "overlays/you_died.png");

        SetDownloadParameters(this.imgBlockA1, "img/Tiles/BlockA1.png");
        SetDownloadParameters(this.imgBlockA2, "img/Tiles/BlockA2.png");
        SetDownloadParameters(this.imgBlockA3, "img/Tiles/BlockA3.png");

        SetDownloadParameters(this.imgBlockB1, "img/Tiles/BlockB1.png");
        SetDownloadParameters(this.imgBlockB2, "img/Tiles/BlockB2.png");
        SetDownloadParameters(this.imgBlockB3, "img/Tiles/BlockB3.png");

        SetDownloadParameters(this.imgGem, "img/Tiles/Gem.png");

        SetDownloadParameters(this.imgExit1, "img/Tiles/Exit1.png");
        SetDownloadParameters(this.imgExit2, "img/Tiles/Exit2.png");
        SetDownloadParameters(this.imgExit3, "img/Tiles/Exit3.png");

        SetDownloadParameters(this.imgPlatform1, "img/Tiles/Platform1.png");
        SetDownloadParameters(this.imgPlatform2, "img/Tiles/Platform2.png");
        SetDownloadParameters(this.imgPlatform3, "img/Tiles/Platform3.png");

        Ticker.addListener(this);
        Ticker.setInterval(50);
    };

    function SetDownloadParameters(assetElement, url) {
        assetElement.src = url;
        assetElement.onload = handleElementLoad;
        assetElement.onerror = handleElementError;
    };

    function SetAudioDownloadParameters(assetElement, url) {
        assetElement.src = url;
        // Precharging the sound
        assetElement.load();
    };

    // our global handler 
    function handleElementLoad(e) {
        numElementsLoaded++;

        // If all elements have been downloaded
        if (numElementsLoaded === NUM_ELEMENTS_TO_DOWNLOAD) {
            stage.removeChild(downloadProgress);
            Ticker.removeAllListeners();
            numElementsLoaded = 0;
            // we're calling back the method set by SetDownloadCompleted
            ondownloadcompleted();
        }
    }

    //called if there is an error loading the image (usually due to a 404)
    function handleElementError(e) {
        console.log("Error Loading Asset : " + e.target.src);
    }

    // Update methid which simply shows the current % of download
    this.tick = function() {
        downloadProgress.text = "Downloading " + Math.round((numElementsLoaded / NUM_ELEMENTS_TO_DOWNLOAD) * 100) + " %";

        // update the stage:
        stage.update();
    };
}

