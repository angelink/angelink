'use strict';

/* jshint camelcase:false */

angular.module('n4j.common.services')

  .factory('requestAnimFrame', function () {
    // RequestAnimFrame: a browser API for getting smooth animations
    return (function(){
      return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();
  })

  .factory('Particle', function () {
    var Particle = function (ctx, radius, width, height) {

      this.ctx = ctx;
      this.radius = radius;

      // Position them randomly on the canvas
      // Math.random() generates a random value between 0
      // and 1 so we will need to multiply that with the
      // canvas width and height.
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      
      
      // We would also need some velocity for the particles
      // so that they can move freely across the space
      this.vx = -1 + Math.random() * 2;
      this.vy = -1 + Math.random() * 2;
      
      // This is the method that will draw the Particle on the
      // canvas. It is using the basic fillStyle, then we start
      // the path and after we use the `arc` function to 
      // draw our circle. The `arc` function accepts four
      // parameters in which first two depicts the position
      // of the center point of our arc as x and y coordinates.
      // The third value is for radius, then start angle, 
      // end angle and finally a boolean value which decides
      // whether the arc is to be drawn in counter clockwise or 
      // in a clockwise direction. False for clockwise.
      this.draw = function() {
        this.ctx.fillStyle = 'rgba(200,200,200,0.8)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        
        // Fill the color to the arc that we just created
        this.ctx.fill();
      };
    };

    return Particle;
  })

  .service('particleUtils', function (utils) {

    // Distance calculator between two particles
    var distance = function (ctx, count, p1, p2) {
      var dist;
      var minDist = 70;
      var dx = p1.x - p2.x;
      var dy = p1.y - p2.y;
      
      dist = Math.sqrt(dx*dx + dy*dy);
          
      // Draw the line when distance is smaller
      // then the minimum distance
      if(dist <= minDist) {
        
        var fill = 'rgba(255,255,255,'+ (1.2-dist/minDist) +')';

        // Draw the line
        ctx.beginPath();
        ctx.strokeStyle = fill;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
        
        // Some acceleration for the partcles 
        // depending upon their distance
        var ax = dx/(utils.getRandomInt(50, 150)*count);
        var ay = dy/(utils.getRandomInt(50, 150)*count);
        
        // Apply the acceleration on the particles
        p1.vx -= ax;
        p1.vy -= ay;
        
        p2.vx += ax;
        p2.vy += ay;
      }
    };

    // Give every particle some life
    var update = function (ctx, particles, width, height) {
        
      // In this function, we are first going to update every
      // particle's position according to their velocities
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        
        // Change the velocities
        p.x += p.vx;
        p.y += p.vy;
          
        // We don't want to make the particles leave the
        // area, so just change their position when they
        // touch the walls of the window
        if (p.x + p.radius > width) {
          p.x = p.radius;
        }
        else if (p.x - p.radius < 0) {
          p.x = width - p.radius;
        }
        
        if(p.y + p.radius > height) {
          p.y = p.radius;
        }
        else if (p.y - p.radius < 0) {
          p.y = height - p.radius;
        }
        
        // Now we need to make them attract each other
        // so first, we'll check the distance between
        // them and compare it to the minDist we have
        // already set
        
        // We will need another loop so that each
        // particle can be compared to every other particle
        // except itself
        for(var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          distance(ctx, particles.length, p, p2);
        }
      
      }
    };

    var paintCanvas = function (ctx, width, height) {
      ctx.clearRect(0, 0, width, height);
    };

    // Function to draw everything on the canvas that we'll use when 
    // animating the whole scene.
    this.draw = function (ctx, particles, width, height) {
      
      // Call the paintCanvas function here so that our canvas
      // will get re-painted in each next frame
      paintCanvas(ctx, width, height);
      
      // Call the function that will draw the balls using a loop
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.draw();
      }
      
      //Finally call the update function
      update(ctx, particles, width, height);
    };

    return this;
  });