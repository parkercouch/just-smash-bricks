# brick-smashing-game (Working Title)

## Developer's Journal

#### Goals
* Polished and lots of juice
* Good music and sounds
* Easy controls + mobile friendly

#### Ideas
* Continuous levels
* Multi-ball
* Unbreakable bricks
* 1 to 10 hit bricks
* Teleports/Ball catchers
* Falling blocks / bombs
* (Stretch Goal) Long-term xp and upgrades

#### Aesthetics
* Basic pixel artwork or generated textures
* Synthesized music and sounds (possibly updated on the fly)
* Bounce on hit. Shake on break.
* Particles!

#### Possible Tools/Libraries needed
* Kontra.js - Main game loops, asset management, key presses
* Playful.js ease - To smooth animations
* Javascript-state-machine - To manage high level states (menu, game, pause)
* TinyMusic - Synthesize sounds programmatically
* Particle.js - For particles if no time to write my own
* _______ - event management. Will probably just write my own
* _______ - physics. Will write my own.

### Day 1
Set up project skeleton and found libraries that could be used to help with certain
aspects of the game. Once those were ready then I started on making the overall structure and flow of the game.

I used the javascript-state-machine library to make a state machine that contained
the needed high level states (loading, menu, game, paused). I then linked them up so
they would transition to the next. 

I then added some asset loading to the loading phase (with some temp files to test).
That then triggers the next state on successful load. The fail case will eventually
be just generating basic sprites, but that will need to be added later.

Next was the basic game loop. Kontra.js makes this pretty simple so setting it up was
painless. I then got the paddle sprite drawn with movement on keypress. And the ball
drawn and moving (with no collision).

At this point things were getting a bit messy so I did some refactoring. I tried to
make a large change and it ended up more confusing so reverted back to the original
design. I will deal with that once I have the core functionality finished. Everything
is still in flux at the moment so no need to stress too much about that now.

The next step would be the most time consuming. Collision detection is the core
mechanic of a breakout-style game so I needed to get that working well. The built-in
collision detection in Kontra is basic and didn't provide the needed info. Mainly I
needed to know where the collision was happening so that the ball could reflect the
correct direction. I found some different algorithms online and also found a tutorial
where someone had implemented collision detection for pong/breakout in JS. I took the
core functionality of that and spent a couple hours making it fit into my game design. I finally got that working which was a huge step forward. I now need to
bundle that functionality up so it is available to all moving objects in the game
instead of just the main ball object. I can override Kontra's collidesWith function
so it will work seamlessly with the rest of the engine.

Now that there is basic collision detection I could draw multiple bricks and test it
out. The object pool functionality of Kontra was giving me some issues and I actually
found a possible bug in the code. I created a temp fix to get my game working and got
multiple bricks drawn to the screen. 

##### BUGS/ISSUES:
The paddle and edges have weird collision detection that causes the ball to leave the
screen or not hit the paddle. The general collision detection algorithm needs applied
to those as well to fix that.

##### NEXT STEPS:
* Apply collision detection generally and use a quad tree/etc to keep checks to a min
* Add a win condition when all bricks are gone
* Add a lose condition when ball leaves the bottom of the screen
* Add a ball start functionality (Launches off paddle to start game)

