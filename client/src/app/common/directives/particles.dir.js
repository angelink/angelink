'use strict';

angular.module('n4j.common.directives')

  .directive('particles', function (_, $window, requestAnimFrame, Particle, particleUtils) {

    var clearCanvas = function (ctx) {
      // Store the current transformation matrix
      ctx.save();

      // Use the identity matrix while clearing the canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Restore the transform
      ctx.restore();
    };

    var addParticles = function (ctx, radius, count) {
      var particles = [];
      var canvas = ctx.canvas;
      
      // Set the canvas width and height
      var W = canvas.width;
      var H = canvas.height;

      // Now the idea is to create some particles that will attract
      // each other when they come close. We will set a minimum
      // distance for it and also draw a line when they come
      // close to each other.

      // The attraction can be done by increasing their velocity as 
      // they reach closer to each other

      // Let's make a function that will act as a class for
      // our particles.

      // Time to push the particles into an array
      for(var i = 0; i < count; i++) {
        particles.push(new Particle(ctx, radius, W, H));
      }

      // Start the main animation loop using requestAnimFrame
      var animloop = function () {
        particleUtils.draw(ctx, particles, W, H);
        requestAnimFrame(animloop);
      };

      animloop();
    };

    var link = function (scope, el, attrs) {

      // Dimensions indicating what percent of the containing box
      // the canvas should fill
      var width = parseFloat(attrs.canvasWidth)/100;
      var height = parseFloat(attrs.canvasHeight)/100;

      // Initializing the canvas
      var canvas = el[0];

      var particleCount = attrs.particles;
      var radius = 4; // particle radius

      // Initialize the context of the canvas
      var ctx = canvas.getContext('2d');


      var setDimen = function () {
        ctx.canvas.width = el.parent()[0].clientWidth * (width || 1);
        ctx.canvas.height = el.parent()[0].clientHeight * (height || 1);
      };

      var resizeHandler = function () {
        setDimen(ctx);
        clearCanvas(ctx);
        addParticles(ctx, radius, particleCount);
      };

      angular.element($window).bind('resize', _.debounce(resizeHandler, 100));

      // Delayted to make sure that dimensions are correctly set before doing
      // any sort of calculations
      setTimeout(function () {
        setDimen(ctx);
        clearCanvas(ctx);
        addParticles(ctx, radius, particleCount);
      }, 300);
    };

    return {
      restrict: 'AE',
      link: link
    };
  });