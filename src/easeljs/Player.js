//-----------------------------------------------------------------------------
// Player.js
//
// Inspired by the Microsoft XNA Community Game Platformer Sample
// Copyright (C) Microsoft Corporation. All rights reserved.
// Ported to HTML5 Canvas with EaselJS by David Rousset - http://blogs.msdn.com/davrous
//-----------------------------------------------------------------------------

/// <summary>
/// Our fearless adventurer!
/// </summary>
(function (window) {
    // Constants for controling horizontal movement
    var MoveAcceleration = 13000.0;
    var MaxMoveSpeed = 1750.0;
    var GroundDragFactor = 0.6;
    var AirDragFactor = 0.6;

    // Constants for controlling vertical movement
    var MaxJumpTime = 0.35;
    var JumpLaunchVelocity = -5000.0;
    var GravityAcceleration = 1800.0;
    var MaxFallSpeed = 550.0;
    var JumpControlPower = 0.14;

    var globalTargetFPS = 17;

    var StaticTile = new Tile(null, Enum.TileCollision.Passable, 0, 0);

    // imgPlayer should be the PNG containing the sprite sequence
    // level must be of type Level
    // position must be of type Point
    function Player(imgPlayer, level, position) {
        this.initialize(imgPlayer, level, position);
    }

    // Using EaselJS BitmapSequence as the based prototype
    Player.prototype = new BitmapAnimation();

    Player.prototype.IsAlive = true;
    Player.prototype.HasReachedExit = false;

    /// <summary>
    /// Gets whether or not the player's feet are on the ground.
    /// </summary>
    Player.prototype.IsOnGround = true;

    // constructor:
    //unique to avoid overiding base class
    Player.prototype.BitmapAnimation_initialize = Player.prototype.initialize;

    /// <summary>
    /// Constructors a new player.
    /// </summary>
    Player.prototype.initialize = function (imgPlayer, level, position) {
        var width;
        var left;
        var height;
        var top;
        var frameWidth;
        var frameHeight;

        var localSpriteSheet = new SpriteSheet({
            images: [imgPlayer], //image to use
            frames: { width: 100, height: 110, regX: 50, regY: 110 },
            animations: {
//                walk: [0, 9, "walk", 4],
//                die: [10, 21, false, 4],
//                jump: [22, 32],
//                celebrate: [33, 43, false, 4],
//                idle: [44, 44]
                walk: [0, 0, "walk", 4],
                die: [0, 0, false, 4],
                jump: [0, 0],
                celebrate: [0, 0, false, 4],
                idle: [0, 0]
            }
        });

        SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);

        this.BitmapAnimation_initialize(localSpriteSheet);

        this.level = level;
        this.position = position;

        this.currentCheckpoint = 0;
        this.nextCheckpoint = 0;

        switch (platformerGame.levelIndex) {
            case 0:
                this.currentCheckpoint = 0;
                this.nextCheckpoint = 0;
                break;
            case 1:
                this.currentCheckpoint = 2;
                this.nextCheckpoint = 3;
                this.ChangeSkin();
                break;
            case 2:
                this.currentCheckpoint = 4;
                this.nextCheckpoint = 5;
                this.ChangeSkin();
                break;
        }

        this.maxSkin = this.level.levelContentManager.imgRobot.length;

        this.velocity = new Point(0, 0);
        this.previousBottom = 0.0;

        this.elapsed = 0;

        this.isJumping = false;
        this.wasJumping = false;
        this.jumpTime = 0.0;

        frameWidth = this.spriteSheet.getFrame(0).rect.width;
        frameHeight = this.spriteSheet.getFrame(0).rect.height;

        // Calculate bounds within texture size. 
        width = parseInt(64);
        left = parseInt((frameWidth - width) / 2);
        height = parseInt(96);
        top = parseInt(frameHeight - height);
        this.localBounds = new XNARectangle(left, top, width, height);

        // set up a shadow. Note that shadows are ridiculously expensive. You could display hundreds
        // of animated monster if you disabled the shadow.
        if (enableShadows)
            this.shadow = new Shadow("#000", 3, 2, 2);

        this.name = "Hero";

        // 1 = right & -1 = left & 0 = idle
        this.direction = 0;
        this.lastdirection = 1;

        // starting directly at the first frame of the walk_right sequence
        this.currentFrame = 66;

        this.Reset(position);
    };

    /// <summary>
    /// Resets the player to life.
    /// </summary>
    /// <param name="position">The position to come to life at.</param>
    Player.prototype.Reset = function (position) {
        this.x = position.x;
        this.y = position.y;
        this.velocity = new Point(0, 0);
        this.IsAlive = true;
        this.level.IsHeroDied = false;
        this.gotoAndPlay("idle");
    };

    /// <summary>
    /// Gets a rectangle which bounds this player in world space.
    /// </summary>
    Player.prototype.BoundingRectangle = function () {
        var left = parseInt(Math.round(this.x - 50) + this.localBounds.x);
        var top = parseInt(Math.round(this.y - 110) + this.localBounds.y);

        return new XNARectangle(left, top, this.localBounds.width, this.localBounds.height);
    };

    /// <summary>
    /// Handles input, performs physics, and animates the player sprite.
    /// </summary>
    /// <remarks>
    /// We pass in all of the input states so that our game is only polling the hardware
    /// once per frame. We also pass the game's orientation because when using the accelerometer,
    /// we need to reverse our motion when the orientation is in the LandscapeRight orientation.
    /// </remarks>
    Player.prototype.tick = function () {
        // It not possible to have a predictable tick/update time
        // requestAnimationFrame could help but is currently not widely and properly supported by browsers
        // this.elapsed = (Ticker.getTime() - this.lastUpdate) / 1000;
        // We're then forcing/simulating a perfect world
        this.elapsed = globalTargetFPS / 1000;

        this.ApplyPhysics();

        if (this.IsAlive && this.IsOnGround && !this.HasReachedExit) {
            if (Math.abs(this.velocity.x) - 0.02 > 0) {
                // Checking if we're not already playing the animation
                if (this.currentAnimation.indexOf("walk") === -1 && this.direction === -1) {
                    this.gotoAndPlay("walk");
                }
                if (this.currentAnimation.indexOf("walk_h") === -1 && this.direction === 1) {
                    this.gotoAndPlay("walk_h");
                }
            }
            else {
                if (this.currentAnimation.indexOf("idle") === -1 && this.direction === 0) {
                    if (this.lastdirection === 1) {
                        this.gotoAndPlay("idle_h");
                    } else {
                        this.gotoAndPlay("idle");
                    }
                }
            }
        }

        // Clear input.
        this.isJumping = false;
    };

    /// <summary>
    /// Updates the player's velocity and position based on input, gravity, etc.
    /// </summary>
    Player.prototype.ApplyPhysics = function () {
        if (this.IsAlive && !this.HasReachedExit) {
            var previousPosition = new Point(this.x, this.y);

            // Base velocity is a combination of horizontal movement control and
            // acceleration downward due to gravity.
            this.velocity.x += this.direction * MoveAcceleration * this.elapsed;
            this.velocity.y = Math.clamp(this.velocity.y + GravityAcceleration * this.elapsed, -MaxFallSpeed, MaxFallSpeed);

            this.velocity.y = this.DoJump(this.velocity.y);

            // Apply pseudo-drag horizontally.
            if (this.IsOnGround) {
                this.velocity.x *= GroundDragFactor;
            }
            else {
                this.velocity.x *= AirDragFactor;
            }

            // Prevent the player from running faster than his top speed.
            this.velocity.x = Math.clamp(this.velocity.x, -MaxMoveSpeed, MaxMoveSpeed);

            this.x += this.velocity.x * this.elapsed;
            this.y += this.velocity.y * this.elapsed;
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);

            // If the player is now colliding with the level, separate them.
            this.HandleCollisions();

            // If the collision stopped us from moving, reset the velocity to zero.
            if (this.x === previousPosition.x) {
                this.velocity.x = 0;
            }

            if (this.y === previousPosition.y) {
                this.velocity.y = 0;
            }
        }
    };

    /// <summary>
    /// Calculates the Y velocity accounting for jumping and
    /// animates accordingly.
    /// </summary>
    /// <remarks>
    /// During the accent of a jump, the Y velocity is completely
    /// overridden by a power curve. During the decent, gravity takes
    /// over. The jump velocity is controlled by the jumpTime field
    /// which measures time into the accent of the current jump.
    /// </remarks>
    /// <param name="velocityY">
    /// The player's current velocity along the Y axis.
    /// </param>
    /// <returns>
    /// A new Y velocity if beginning or continuing a jump.
    /// Otherwise, the existing Y velocity.
    /// </returns>
    Player.prototype.DoJump = function (velocityY) {
        // If the player wants to jump
        if (this.isJumping) {
            // Begin or continue a jump
            if ((!this.wasJumping && this.IsOnGround) || this.jumpTime > 0.0) {
                if (this.jumpTime == 0.0) {
                    this.level.levelContentManager.playerJump.play();
                }

                this.jumpTime += this.elapsed;
                // Playing the proper animation based on
                // the current direction of our hero
                if (this.direction == 1) {
                    this.gotoAndPlay("jump_h");
                }
                else {
                    this.gotoAndPlay("jump");
                }
            }

            // If we are in the ascent of the jump
            if (0.0 < this.jumpTime && this.jumpTime <= MaxJumpTime) {
                // Fully override the vertical velocity with a power curve that gives players more control over the top of the jump
                velocityY = JumpLaunchVelocity * (1.0 - Math.pow(this.jumpTime / MaxJumpTime, JumpControlPower));
            }
            else {
                // Reached the apex of the jump
                this.jumpTime = 0.0;
            }
        }
        else {
            // Continues not jumping or cancels a jump in progress
            this.jumpTime = 0.0;
        }
        this.wasJumping = this.isJumping;

        return velocityY;
    };

    /// <summary>
    /// Detects and resolves all collisions between the player and his neighboring
    /// tiles. When a collision is detected, the player is pushed away along one
    /// axis to prevent overlapping. There is some special logic for the Y axis to
    /// handle platforms which behave differently depending on direction of movement.
    /// </summary>
    Player.prototype.HandleCollisions = function () {
        var bounds = this.BoundingRectangle();
        var leftTile = Math.floor(bounds.Left() / StaticTile.Width);
        var rightTile = Math.ceil((bounds.Right() / StaticTile.Width)) - 1;
        var topTile = Math.floor(bounds.Top() / StaticTile.Height);
        var bottomTile = Math.ceil((bounds.Bottom() / StaticTile.Height)) - 1;

        // Reset flag to search for ground collision.
        this.IsOnGround = false;

        // For each potentially colliding tile,
        for (var y = topTile; y <= bottomTile; ++y) {
            for (var x = leftTile; x <= rightTile; ++x) {
                // If this tile is collidable,
                var collision = this.level.GetCollision(x, y);
                if (collision !== Enum.TileCollision.Passable) {
                    // Determine collision depth (with direction) and magnitude.
                    var tileBounds = this.level.GetBounds(x, y);
                    var depth = bounds.GetIntersectionDepth(tileBounds);
                    if (depth.x !== 0 && depth.y !== 0) {
                        var absDepthX = Math.abs(depth.x);
                        var absDepthY = Math.abs(depth.y);

                        // Resolve the collision along the shallow axis.
                        if (absDepthY < absDepthX || collision == Enum.TileCollision.Platform) {
                            // If we crossed the top of a tile, we are on the ground.
                            if (this.previousBottom <= tileBounds.Top()) {
                                this.IsOnGround = true;
                            }

                            // Ignore platforms, unless we are on the ground.
                            if (collision == Enum.TileCollision.Impassable || this.IsOnGround) {
                                // Resolve the collision along the Y axis.
                                this.y = this.y + depth.y;

                                // Perform further collisions with the new bounds.
                                bounds = this.BoundingRectangle();
                            }
                        }
                        else if (collision == Enum.TileCollision.Impassable) // Ignore platforms.
                        {
                            // Resolve the collision along the X axis.
                            this.x = this.x + depth.x;

                            // Perform further collisions with the new bounds.
                            bounds = this.BoundingRectangle();
                        }
                    }
                }
            }
        }

        // Save the new bounds bottom.
        this.previousBottom = bounds.Bottom();
    };

    /// <summary>
    /// Called when the player has been killed.
    /// </summary>
    /// <param name="killedBy">
    /// The enemy who killed the player. This parameter is null if the player was
    /// not killed by an enemy (fell into a hole).
    /// </param>
    Player.prototype.OnKilled = function (killedBy) {
        this.IsAlive = false;
        this.velocity = new Point(0, 0);

        // Playing the proper animation based on
        // the current direction of our hero
        if (this.direction === 1) {
            this.gotoAndPlay("die_h");
        }
        else {
            this.gotoAndPlay("die");
        }

        if (killedBy !== null && killedBy !== undefined) {
            this.level.levelContentManager.playerKilled.play();
        }
        else {
            this.level.levelContentManager.playerFall.play();
        }
    };

    /// <summary>
    /// Called when this player reaches the level's exit.
    /// </summary>
    Player.prototype.OnReachedExit = function () {
        this.HasReachedExit = true;
        this.level.levelContentManager.exitReached.play();

        // Playing the proper animation based on
        // the current direction of our hero
        if (this.direction === 1) {
            this.gotoAndPlay("celebrate_h");
        }
        else {
            this.gotoAndPlay("celebrate");
        }
    };

    Player.prototype.ChangeSkin = function () {

//        if (this.currentCheckpoint <= this.maxSkin) {
            //this.level.Hero.currentCheckpoint++;

            var localSpriteSheet = new SpriteSheet({
                images: [this.level.levelContentManager.imgRobot[this.currentCheckpoint]],
                frames: { width: 100, height: 100, regX: 50, regY: 110 },
                animations: {
//                    walk: [0, 9, "walk", 4],
//                    die: [10, 21, false, 4],
//                    jump: [22, 32],
//                    celebrate: [33, 43, false, 4],
//                    idle: [44, 44]
                    walk: [0, 0, "walk", 4],
                    die: [0, 0, false, 4],
                    jump: [0, 0],
                    celebrate: [0, 0, false, 4],
                    idle: [0, 0]
                }
            });

            SpriteSheetUtils.addFlippedFrames(localSpriteSheet, true, false, false);
            this.spriteSheet = localSpriteSheet;
//        }
    }

    Player.prototype.fireBullet = function() {
        // create the bullet
        if (this.currentCheckpoint >= 3) {
            var position = {x: this.x, y: this.y};
            this.level.createBullet(position, this.lastdirection);
        }
    }

    window.Player = Player;
} (window));
