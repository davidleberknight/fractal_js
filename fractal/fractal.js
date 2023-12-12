// FRACTAL JAVASCRIPT
// 

class Fractal
{
   constructor(h, w)
   {
     this.maxIters = -2;
     this.currentDrawing = null; 
     this.canvasHeight = h;
     this.canvasWidth = w;
     this.nextStack = new Stack();;
     this.previousStack = new Stack();
     this.firstPaint = true;
   }
   
   doDraw(zoom)
   {
    try
    {
      this.maxIters = maxIterationsInput.value;
      //ComplexPoint juliaPoint = new ComplexPoint();
      let newDrawing = new Drawing( INITIAL_MANDLEBROT_RECT, this.maxIters );
      
      if( this.firstPaint )
      {
        this.currentDrawing = newDrawing;
      }
      let newImage = new Image(canvas.height,canvas.width);
      newDrawing.imageData = newImage.imageData; 
      newDrawing.complexRectangle = this.currentDrawing.complexRectangle;
      newDrawing.complexRectangle = this.getMouseZoomRect( zoom, newDrawing );

      this.expandRectToFitImage( newDrawing.complexRectangle );
      newDrawing.zoomRectangle = zoom;
      
      this.makeNewFractal(newDrawing)//, juliaPoint);
          
      canvasContext.putImageData(newDrawing.imageData, 0, 0);
      canvasContext.stroke();   
      if ( ! this.firstPaint )
      {
        this.previousStack.push( this.currentDrawing ); // Current becomes previous.
      }
      else
      {
        this.firstPaint = false;
      }
      this.currentDrawing = newDrawing;

      // DEBUG LOG........................
      //console.log( "FRACTAL... (rmin, rmax, imin, imax):" + newDrawing.complexRectangle.rMin + " : " + newDrawing.complexRectangle.rMax + " : " + newDrawing.complexRectangle.iMin + " : " +newDrawing.complexRectangle.iMax );
    }
    catch( e )
    {
      console.log("ERROR CAUGHT " + e + " : " );
    }
   }
   
   doNext()
   {
     if( ! this.nextStack.isEmpty())
     {
       this.doNextPrevious( this.nextStack, this.previousStack );
     }
   }
   
   doPrevious()
   {
     if( ! this.previousStack.isEmpty())
     {
       this.doNextPrevious( this.previousStack, this.nextStack );
     }
   }
   
   doDelete()
   {
      if(this.previousStack.isEmpty() &&  this.nextStack.isEmpty())
      {
        return; // Don't delete the last Drawing.
      }

      let newCurrentDrawing = null;

      if( ! this.nextStack.isEmpty() )
      {
        newCurrentDrawing = this.nextStack.pop();
      }
      else
      {
        newCurrentDrawing = this.previousStack.pop();
      }
      this.currentDrawing = newCurrentDrawing;
      //setColor( newCurrentDrawing.getColor() );          
      this.redraw(); 
      maxIterationsInput.value=this.currentDrawing.iters;
   }
     
  doNextPrevious(fromStack, toStack)
  {
      toStack.push( this.currentDrawing );
      let newCurrentDrawing = fromStack.pop();
      this.currentDrawing = newCurrentDrawing;
      this.redraw(); 
      maxIterationsInput.value=this.currentDrawing.iters;
  }
  
  redraw()
  {
      canvasContext.putImageData(this.currentDrawing.imageData, 0, 0);
      canvasContext.stroke();
      if( this.currentDrawing.zoomRectangle != null )
      { 
        drawXORRectangle(this.currentDrawing.zoomRectangle);
      }
  }

  expandRectToFitImage( complexRect )
  {
    // The complex rectangle must be scaled to fit the pixel image view.
    // Method: compare the width/height ratios of the two rectangles.
    let imageWHRatio = 1.0;
    let complexWHRatio = 1.0;
    let iMin = complexRect.iMin;
    let iMax = complexRect.iMax;
    let rMin = complexRect.rMin;
    let rMax = complexRect.rMax;
    let complexWidth = rMax - rMin;
    let complexHeight = iMax - iMin;
    let imageWidth = canvas.width;
    let imageHeight = canvas.height;

    if( ( imageWidth != 0 ) && ( imageHeight != 0 ) )
    {
      imageWHRatio = (imageWidth / imageHeight);
    }
    else return;

    if( ( complexWidth != 0 ) && ( complexHeight != 0 ) )
    {
      complexWHRatio = complexWidth / complexHeight;
    }
    else return;

    if( imageWHRatio == complexWHRatio ) return;

    if( imageWHRatio < complexWHRatio )
    {
      // Expand vertically
      let newHeight = complexWidth / imageWHRatio;
      let heightDifference =  newHeight - complexHeight ;
      if(heightDifference < 0) { heightDifference = -heightDifference;}
      iMin = iMin - heightDifference / 2;
      iMax = iMax + heightDifference / 2;
    }
    else
    {
      // Expand horizontally
      let newWidth = complexHeight * imageWHRatio;
      let widthDifference = newWidth - complexWidth;
      if(widthDifference<0) { widthDifference = -widthDifference;}
      rMin = rMin - widthDifference / 2;
      rMax = rMax + widthDifference / 2;
    }
    complexRect.iMin=iMin;
    complexRect.iMax=iMax;
    complexRect.rMin=rMin;
    complexRect.rMax=rMax;
  } 
  
  getMouseZoomRect( zoom, newDrawing )
  {
    // Map from pixel coordinates to the imaginary plane.
    let zoomXMin = zoom.x1;
    let zoomXMax = zoomXMin + zoom.w;
    let zoomYMin = zoom.y1;
    let zoomYMax = zoomYMin + zoom.h;

    let p1 = this.getComplexPoint( zoomXMin, zoomYMin, newDrawing );
    let p2 = this.getComplexPoint( zoomXMax, zoomYMax, newDrawing );
    let newRect = new ComplexRectangle();
    newRect.set( p1, p2 );
    return  newRect;
  }

  getComplexPoint(x, y, newDrawing)
  {
     let currentRect = newDrawing.complexRectangle;
     // Delta is the numerical range covered per pixel.
     let delta = currentRect.getWidth() / ( this.canvasWidth );
     let r = currentRect.rMin + ( x * delta );
     let i = currentRect.iMin + (((this.canvasHeight ) - y ) * delta );
     return new ComplexPoint( r, i );
  } 

  makeNewFractal( newDrawing )
  {
    let calculator = new MandelbrotCalculator( newDrawing );
    calculator.calcFractal();
  }
}
// HELPER CLASSES //

class Colour
{
  r = 0;
  g = 0;
  b = 0;
  a = 255;
}

class ComplexPoint
{
  constructor(_real, _imaginary )
  {
    this.real = _real;
    this.imaginary = _imaginary;
  } 
}

class ComplexRectangle
{
   constructor(_rMin, _rMax,_iMin,_iMax)
   {
     this.iMin = _iMin;
     this.iMax = _iMax;
     this.rMin = _rMin;
     this.rMax = _rMax;
   }

  getHeight()
  {
    return this.iMax - this.iMin;
  }

  getWidth()
  {
    return this.rMax - this.rMin;
  }

  set(p1, p2)
  {
    let r1 = p1.real;
    let r2 = p2.real;
    let i1 = p1.imaginary;
    let i2 = p2.imaginary;

    if( r1 > r2 )
    {
      this.rMin = r2;
      this.rMax = r1;
    }
    else
    {
      this.rMin = r1;
      this.rMax = r2;
    }
    if( i1 > i2 )
    {
      this.iMin = i2;
      this.iMax = i1;
    }
    else
    {
      this.iMin = i1;
      this.iMax = i2;
    }
  }
}

class Drawing 
{
  constructor( _rect, _iters )
  {
   this.iters= _iters;
   this.complexRectangle = _rect;
   this.imageData=null;
   this.zoomRectangle = null;
  }
}

class PixelRectangle
{
  constructor( x_ul, y_ul, width, height )
  {
    this.x1 = x_ul;
    this.y1 = y_ul;
    this.w = width;
    this.h = height;
  }
}

class Stack
{
    constructor() {
        this.items = [];
    }

    push(element) {
        return this.items.push(element);
    }
    
    pop() {
        if(this.items.length > 0) {
            return this.items.pop();
        }
    }

    isEmpty(){
       return this.items.length == 0;
    }
}


