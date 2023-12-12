
class MandelbrotCalculator
{
   constructor( _drawing )
   {
     this.drawing = _drawing;
   }
   
  calcFractal()
  {
    // Assign a color to every pixel ( x , y ) in the Image, corresponding to
    // one point, z, in the imaginary plane ( zr, zi ).
    let imageWidth = canvas.width;
    let imageHeight = canvas.height;
    let canvasData = canvasContext.getImageData(0, 0, imageWidth, imageHeight);

    // For each pixel...
    for(  let x = 0; x < imageWidth; x++ )
    {
      for(  let y = 0; y < imageHeight; y++ )
      {
        let c = this.getColor( x, y );
        let index = (x + y * imageWidth) * 4;
    
        canvasData.data[index + 0] = c.r;
        canvasData.data[index + 1] = c.g;
        canvasData.data[index + 2] = c.b;
        canvasData.data[index + 3] = c.a;
      } 
    }
    this.drawing.imageData = canvasData;
   }
     
  getColor(x, y)
  {
    let c = new Colour();
    c.r = 50;
    c.g = 50;
    c.b = 50;

    let rRangeMin = this.drawing.complexRectangle.rMin;
    let iRangeMin = this.drawing.complexRectangle.iMin;
    let rRangeMax = this.drawing.complexRectangle.rMax;
    let imageWidth = 500;
    let imageHeight = 500;
    let delta  = (rRangeMax - rRangeMin) / imageWidth;
    
    let zR = rRangeMin + ( x ) * delta;
    let zI = iRangeMin + (( imageHeight - y )) * delta;

    // Is the point inside the set?
    let numIterations = this.testPoint( zR, zI, this.drawing.iters );
 
    if( numIterations != 0 )
    {
      // The point is outside the set. It gets a color based on the number
      // of iterations it took to know this.
      let numColors = 1024;
      let colorNum =  numColors * ( 1.0 -
                     (numIterations / this.drawing.iters ));
                     
      colorNum = (colorNum == numColors) ? 0 : colorNum;
      let scale = numIterations / this.drawing.iters;
      let rgb = parseInt( 255 * scale );
  
      c.r = 0;
      c.g = rgb;
      c.b = 0;
    }
    return c;
  } 
  
  testPoint(cR, cI, maxIterations)
  {
    // Is the given complex point, (cR, cI), in the Mandelbrot set?
    // Use the formula: z <= z*z + c, where z is initially equal to c.
    // If |z| >= 2, then the point is not in the set.
    // Return 0 if the point is in the set; else return the number of
    // iterations it took to decide that the point is not in the set.
    let zR = cR;
    let zI = cI;
    for( let i = 1; i <= maxIterations; i++ )
    {
       // To square a complex number: (a+bi)(a+bi) = a*a - b*b + 2abi
       let zROld = zR;
       zR = zR * zR - zI * zI + cR;
       zI = 2 * zROld * zI + cI;

       // We know that if the distance from z to the origin is >= 2
       // then the point is out of the set.  To avoid a square root,
       // we'll instead check if the distance squared >= 4.
       let distSquared = zR * zR + zI * zI;
       if( distSquared >= 4 )
       {
          return i;
       }
  }
  return 0;
  }
}
 
