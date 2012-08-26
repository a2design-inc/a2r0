(function (window) {

    /// <summary>
    /// The speed at which this enemy moves along the X axis.
    /// </summary>
    var bulletSpeed = 16;

    // Local bounds used to calculate collision between bullets and the enemies
    var localBounds;

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
        this.y = position.y-48;

        var localSpriteSheet = new SpriteSheet({
            images: [texture], //image to use
            frames: { width: 16, height: 16, regX: 8, regY: 16 },
            animations: {
                shoot: [0, 3, "shoot", 4]
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

        switch(direction) {
            case 1:
                this.gotoAndPlay("shoot"); //animate
                break;
            case -1:
                this.gotoAndPlay("shoot_h"); //animate
                break;
        }
        //this.currentFrame = 0;
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

    Bullet.prototype.tick = function (i) {
        // handle bullet movement and looping

        if (this.outOfScreen(i)) {
            this.Destroy(i);
        } else {
            this.x += this.direction * bulletSpeed;
            this.HandleCollisions(i);
        }
    }

    Bullet.prototype.outOfScreen = function(i) {
        var comp;
        if (this.level.Hero.x < 480) {
            comp = 480;
        } else {
            comp = this.level.Hero.x;
        }

        if (Math.abs(this.x-comp) > 480+32) {
            return true;
        }
        return false;
    }

    Bullet.prototype.HandleCollisions = function (i) {
        var bounds = this.BoundingRectangle();
        if (this.direction == 1) {
            var neighborTile = Math.ceil((bounds.Right() / 32)) - 1;
        } else {
            var neighborTile = Math.floor(bounds.Left() / 32);
        }
        //console.log(neighborTile);
        var collision = this.level.GetCollision(neighborTile, Math.floor(this.y/32));

        if (collision) {
            this.Destroy(i);
        }

        Bullet.prototype.Destroy = function (i) {
            this.level.bulletStream.splice(i,1);
            this.level.levelStage.removeChild(this);
        }
    }

    window.Bullet = Bullet;
} (window));