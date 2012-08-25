(function (window) {

    /// <summary>
    /// The speed at which this enemy moves along the X axis.
    /// </summary>
    var bulletSpeed = 16;

    // Local bounds used to calculate collision between bullets and the enemies
    var localBounds;

    var iterations = 0;

    function Bullet(level, position, direction, texture) {
        this.initialize(level, position, direction, texture);
    }

    Bullet.prototype = new BitmapAnimation();

    // constructor:
    //unique to avoid overiding base class
    Bullet.prototype.BitmapAnimation_initialize = Bullet.prototype.initialize;

    Bullet.prototype.initialize = function(level, position, direction, texture) {

        var width;
        var left;
        var height;
        var top;
        var frameWidth;
        var frameHeight;

        this.level = level;
        this.x = position.x;
        this.y = position.y;

        var localSpriteSheet = new SpriteSheet({
            images: [texture], //image to use
            frames: { width: 16, height: 16, regX: 8, regY: 16 },
            animations: {
                shoot: [0, 0, "shoot", 1]
            }
        });

        SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);

        this.BitmapAnimation_initialize(localSpriteSheet);

        frameWidth = this.spriteSheet.getFrame(0).rect.width;
        frameHeight = this.spriteSheet.getFrame(0).rect.height;

        // Calculate bounds within texture size.
        width = parseInt(frameWidth * 1);
        left = parseInt((frameWidth - width) / 2);
        height = parseInt(frameWidth * 1);
        top = parseInt(frameHeight - height);
        localBounds = new XNARectangle(left, top, width, height);

        this.gotoAndPlay("shoot"); //animate
        this.currentFrame = 0;
        this.direction = direction;
        //this.level.levelStage.addChild();


    };

    /// <summary>
    /// Gets a rectangle which bounds this enemy in world space.
    /// </summary>
    Bullet.prototype.BoundingRectangle = function () {
        var left = parseInt(Math.round(this.x - 8) + localBounds.x);
        var top = parseInt(Math.round(this.y - 16) + localBounds.y);

        return new XNARectangle(left, top, localBounds.width, localBounds.height);
    };

    Bullet.prototype.tick = function () {
        // handle bullet movement and looping
//        for (var i = 0 ; i < this.level.bulletStream.length; i++) {
//            var o = this.level.bulletStream[i];
//            if(!o) { continue; }
//            if(this.outOfScreen(o)) {
//                this.level.bulletStream.splice(i, 1);
//                this.level.levelStage.removeChild(o);
//            }
//            o.x += this.direction * bulletSpeed;
//        }
//        iterations++;
        this.x += this.direction * bulletSpeed;
    }

    Bullet.prototype.outOfScreen = function(o) {
        return false;
        //return o.x > this.level.levelStage.x + 960;
    }

    window.Bullet = Bullet;
} (window));