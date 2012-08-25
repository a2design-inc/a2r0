(function (window) {

    /// <summary>
    /// The speed at which this enemy moves along the X axis.
    /// </summary>
    var bulletSpeed = 1;

    // Local bounds used to calculate collision between bullets and the enemies
    var localBounds;

    function Bullet(level, position, size, color) {
        this.initialize(level, position, size, color);
    }

    Bullet.prototype = new Bitmap();

    // constructor:
    //unique to avoid overiding base class
    Bullet.prototype.Bitmap_initialize = Bullet.prototype.initialize;

    Bullet.prototype.initialize = function(level, position, size, color) {
        this.level = level;
        this.x = position.x;
        this.y = position.y - 30;

        this.shape = new Shape();
        this.shape.x = this.x;
        this.shape.y = this.y;
        this.shape.rotation = 1000;
        this.shape.graphics.beginStroke(color).moveTo(-1, 0).lineTo(size, 0);
        this.level.levelStage.addChild(this.shape);

        localBounds = new XNARectangle(this.x, this.y, 1, 1);
    };

    /// <summary>
    /// Gets a rectangle which bounds this enemy in world space.
    /// </summary>
    Bullet.prototype.BoundingRectangle = function () {
        var left = parseInt(Math.round(this.x - 32) + localBounds.x);
        var top = parseInt(Math.round(this.y - 64) + localBounds.y);

        return new XNARectangle(left, top, localBounds.width, localBounds.height);
    };

    Bullet.prototype.tick = function () {
        // handle bullet movement and looping
        var bullet;
        for (bullet in this.level.bulletStream) {
            var o = this.level.bulletStream[bullet];
            if(!o) { continue; }
            if(this.outOfScreen(o)) {
                this.level.bulletStream.splice(bullet, 1);
                this.level.levelStage.removeChild(o);
            }
            o.shape.x += 1 * bulletSpeed;
        }
    }

    Bullet.prototype.outOfScreen = function(o) {
        return o.shape.x > this.level.levelStage.x + 960;
    }

    window.Bullet = Bullet;
} (window));