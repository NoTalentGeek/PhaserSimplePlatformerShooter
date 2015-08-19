var statePlay = {

    create:                         function(){

        game.physics.arcade.gravity.y       = 1200;

        this.tmMap                          = game.add.tilemap('Tilemap1');
        this.tmMap.addTilesetImage          ('Tilemap1', 'ImageTilemap1');
        this.tmMap.setCollisionByExclusion  ([0], true, 'LayerBlock');
        this.layerBackground                = this.tmMap.createLayer('LayerBackground');
        this.layerBlock                     = this.tmMap.createLayer('LayerBlock');
        this.controlKeyboard                = game.input.keyboard.createCursorKeys();

        this.seCoin                         = game.add.audio('SECoin');

        //A function to create coin object in the scene.
        this.ObjectCoinCreate();
        //A function to create player object in the scene.
        this.ObjectPlayerCreate();




        //PROTOTYPE: Bullet fire on key press.
        this.bulletFireRate                     = 100;
        this.bulletNextFire                     = 0;
        this.objectGroupBullet                  = game.add.group();
        this.objectGroupBullet.createMultiple   (50, 'ImageBullet');
        this.objectGroupBullet.setAll           ('checkWorldBounds', true);
        this.objectGroupBullet.setAll           ('outOfBoundsKill', true);
        game.physics.arcade.enable              (this.objectGroupBullet);
        this.objectGroupBullet.enableBody       = true;





    },

    preRender:                      function(){

        //Codes to adjust this.graphicsRangeLine position according this.objectPlayer position.
        this.graphicsRangeLine.x                = this.objectPlayer.x + (this.objectPlayer.width/2);
        this.graphicsRangeLine.y                = this.objectPlayer.y + (this.objectPlayer.height/2);
        this.graphicsRangeLine.rotation         = game.physics.arcade.angleToPointer(this.graphicsRangeLine);
        this.graphicsRangeLine.width            = this.rangeLineLength;

    },

    update:                         function(){

        //A function to handle objects collision within the scene.
        this.CollisionObject();
        //A function to update player (movement, weapon range, etc).
        this.ObjectPlayerUpdate();
        //A function to handle objects overlap within the scene.
        this.OverlapObject();



        if(game.input.activePointer.leftButton.isDown) { this.FireBullet() }
        console.log(50 - this.objectGroupBullet.countDead());
        //console.log(this.objectGroupCoin.countDead());
        var playerX = this.objectPlayer.x + 16;
        var playerY = this.objectPlayer.y + 16;
        this.objectGroupBullet.forEachExists(
            function(_bullet){
                var distance = Math.sqrt(Math.pow((playerX - _bullet.x), 2) + Math.pow((playerY - _bullet.y), 2));
                if(distance >= 100){ _bullet.kill(); }
            }
        );





    },

    CollisionObject:                function(){

        game.physics.arcade.collide(this.objectPlayer,    this.layerBlock);
        game.physics.arcade.collide(this.objectGroupCoin, this.layerBlock);

    },

    //A function to get reference from Tiled object layer from custom properties of 'type'.
    //This function is from http://www.gamedevacademy.org/html5-phaser-tutorial-top-down-games-with-tiled/
    FindGameObjectsByType:          function(_layer, _map, _type){

        var findObjects = new Array();
        _map.objects[_layer].forEach(

            function(_element){

                if(_element.properties.type == _type){

                    _element.y -= _map.tileHeight;
                    findObjects.push(_element);

                }

            }

        );
        return findObjects;

    },

    FireBullet:                     function(){

        if (game.time.now > this.bulletNextFire && this.objectGroupBullet.countDead() > 0){

            this.bulletNextFire     = game.time.now + this.bulletFireRate;

            var bullet              = this.objectGroupBullet.getFirstDead();
            bullet.body.allowGravity= false;
            bullet.reset            (this.objectPlayer.x + 16, this.objectPlayer.y + 16);
            bullet.anchor.setTo     (0.5, 0.5);

            game.physics.arcade.moveToPointer(bullet, 600);

        }

    },

    //A function for overlapping player object and coin object.
    PlayerCollectsCoin:             function(_player, _coin){

        //Codes to play sound.
        this.seCoin.play();
        //Codes to delete corresponding overlapping coin.
        _coin.destroy   (true);

    },

    ObjectCoinCreate:               function(){

        var findObjectsCoin                 = this.FindGameObjectsByType('LayerObject', this.tmMap, 'coin');
        this.objectGroupCoin                = game.add.group();
        this.objectGroupCoin.enableBody     = true;
        this.objectArrayCoin                = new Array(findObjectsCoin.length);

        for(var i = 0; i < findObjectsCoin.length; i ++){

            this.objectArrayCoin[i]                 = this.objectGroupCoin.create(findObjectsCoin[i].x, findObjectsCoin[i].y, 'ImageCoin');
            game.physics.arcade.enable              (this.objectArrayCoin[i]);
            this.objectArrayCoin[i].body.immovable  = true;
            this.objectArrayCoin[i].body.moves      = false;

        }

    },

    ObjectPlayerCreate:             function(){

        var findObjectsPlayer                   = this.FindGameObjectsByType('LayerObject', this.tmMap, 'playerPortal');
        this.objectPlayer                       = game.add.sprite(findObjectsPlayer[0].x, findObjectsPlayer[0].y, 'ImagePlayer');
        this.objectPlayer.enabledBody           = true;
        game.physics.arcade.enable              (this.objectPlayer);

        //Codes to draw a line of player's weapon range.
        //this.rangeLength will be dependent to what weapon player equip.
        this.rangeLineLength                    = 100;
        this.graphicsRangeLine                  = game.add.graphics(this.objectPlayer.x, this.objectPlayer.y);
        this.graphicsRangeLine.lineStyle        (1, 0xDF7126, 1);
        this.graphicsRangeLine.moveTo           (0, 0);
        this.graphicsRangeLine.lineTo           (this.rangeLineLength, 0);

    },

    ObjectPlayerUpdate:             function(){

        if      (game.input.keyboard.isDown(Phaser.Keyboard.A)) { this.objectPlayer.body.velocity.x = -200; }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.D)) { this.objectPlayer.body.velocity.x = 200; }
        else                                                    { this.objectPlayer.body.velocity.x = 0; }

        if(

            game.input.keyboard.isDown(Phaser.Keyboard.W) &&
            this.objectPlayer.body.onFloor()

        ){ this.objectPlayer.body.velocity.y = -500; }

    },

    OverlapObject:                  function(){

        game.physics.arcade.overlap(this.objectPlayer, this.objectGroupCoin, this.PlayerCollectsCoin, null, this);

    }

};