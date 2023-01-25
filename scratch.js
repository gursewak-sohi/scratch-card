 (function() {
     'use strict';
     var isDrawing, lastPoint;
     var container = document.getElementById('scratchContainer'),
         canvas = document.getElementById('scratchCanvas'),
         canvasWidth = canvas.width,
         canvasHeight = canvas.height,
         ctx = canvas.getContext('2d'),
         image = new Image(),
         brush = new Image(),
         audio = new Audio('sound/tadaa.mp3');

     // Use base64 Workaround because Same-Origin-Policy
     image.src = 'images/scratch.jpg'


     image.onload = function() {
         ctx.drawImage(image, 0, 0, 300, 300);
         // Show the form when Image is loaded.
         document.querySelector('#coupon').style.display = 'flex';
     };
     brush.src = 'images/cursor.svg';

     canvas.addEventListener('mousedown', handleMouseDown, false);
     canvas.addEventListener('touchstart', handleMouseDown, false);
     canvas.addEventListener('mousemove', handleMouseMove, false);
     canvas.addEventListener('touchmove', handleMouseMove, false);
     canvas.addEventListener('mouseup', handleMouseUp, false);
     canvas.addEventListener('touchend', handleMouseUp, false);

     function distanceBetween(point1, point2) {
         return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
     }

     function angleBetween(point1, point2) {
         return Math.atan2(point2.x - point1.x, point2.y - point1.y);
     }

     // Only test every `stride` pixel. `stride`x faster,
     // but might lead to inaccuracy
     function getFilledInPixels(stride) {
         if (!stride || stride < 1) {
             stride = 1;
         }

         var pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
             pdata = pixels.data,
             l = pdata.length,
             total = (l / stride),
             count = 0;

         // Iterate over all pixels
         for (var i = count = 0; i < l; i += stride) {
             if (parseInt(pdata[i]) === 0) {
                 count++;
             }
         }

         return Math.round((count / total) * 100);
     }

     function getMouse(e, canvas) {
         var offsetX = 0,
             offsetY = 0,
             mx, my;

         if (canvas.offsetParent !== undefined) {
             do {
                 offsetX += canvas.offsetLeft;
                 offsetY += canvas.offsetTop;
             } while ((canvas = canvas.offsetParent));
         }

         mx = (e.pageX || e.touches[0].clientX) - offsetX;
         my = (e.pageY || e.touches[0].clientY) - offsetY;

         return {
             x: mx,
             y: my
         };
     }

     function handlePercentage(filledInPixels) {
         filledInPixels = filledInPixels || 0;

         document.querySelector('#percentage').innerHTML = `${filledInPixels}%`
         if (filledInPixels > 50) {
             canvas.parentNode.removeChild(canvas);
             startConfetti()
             audio.play()
             setTimeout(() => {
                 stopConfetti()
             }, 3000);
         }
     }

     function handleMouseDown(e) {
         isDrawing = true;
         lastPoint = getMouse(e, canvas);
     }

     function handleMouseMove(e) {
         if (!isDrawing) {
             return;
         }

         e.preventDefault();

         var currentPoint = getMouse(e, canvas),
             dist = distanceBetween(lastPoint, currentPoint),
             angle = angleBetween(lastPoint, currentPoint),
             x, y;

         for (var i = 0; i < dist; i++) {
             x = lastPoint.x + (Math.sin(angle) * i) - 15;
             y = lastPoint.y + (Math.cos(angle) * i) - 15;
             ctx.globalCompositeOperation = 'destination-out';
             ctx.drawImage(brush, x, y);
         }

         lastPoint = currentPoint;
         handlePercentage(getFilledInPixels(32));
     }

     function handleMouseUp(e) {
         isDrawing = false;
     }

 })();