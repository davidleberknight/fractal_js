// FRACTAL JAVASCRIPT

const maxIterationsInput=document.querySelector("#maxIterations");
const makeFractalButton=document.querySelector("#makeFractal");
const nextButton=document.querySelector("#next");
const previousButton=document.querySelector("#previous");
const deleteButton=document.querySelector("#delete");
const downloadButton=document.querySelector("#download");
const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");
   
let fractal=null;
let zoom_x1 = 0;
let zoom_y1 = 0; 

const INITIAL_ITERATIONS = 33;
const INITIAL_MANDLEBROT_RECT = new ComplexRectangle( -2.5, 1.5, -2.0, 2.0 );
const INITIAL_JULIA_RECT = new ComplexRectangle( -2.0, 2.0, -2.0, 2.0 );

window.addEventListener("load", () => 
{
   maxIterationsInput.value=INITIAL_ITERATIONS;
   fractal=new Fractal(canvas.height, canvas.width);
   //console.log( "Making Initial Fractal... ");

   let newImage = new Image(canvas.height,canvas.width);
   canvasContext.strokeRect(0,0,canvas.width,canvas.height);
   canvasContext.drawImage(newImage, 0, 0);
   let zoom = new PixelRectangle(0,0,canvas.width,canvas.height);
   fractal.doDraw(zoom);
         
   console.log("Fractal_Type, Iterations, Zoom, iMin, iMax, rMin, rMax");
});

makeFractalButton.addEventListener("click", () =>
{
  fractal.doDraw(fractal.currentDrawing.zoomRectangle);
  // make the zoom to be the whole canvas
  fractal.currentDrawing.zoomRectangle = new PixelRectangle(0,0,canvas.width,canvas.height);
});


nextButton.addEventListener("click", () =>
{
  fractal.doNext();
});


previousButton.addEventListener("click", () =>
{
  fractal.doPrevious();
});


deleteButton.addEventListener("click", () =>
{
  fractal.doDelete();
});

downloadButton.addEventListener("click", () =>
{
  const jpg = document.createElement("a");
  document.body.appendChild(jpg);
  jpg.href=canvas.toDataURL("image/jpeg", 1);
  let rect = fractal.currentDrawing.complexRectangle;
  let zoomFactor = INITIAL_MANDLEBROT_RECT.getWidth() / rect.getWidth();
  let fileName = "M"+fractal.currentDrawing.iters+"_"+zoomFactor+".jpg";
  //let fileName = //fractal.currentDrawing.complexRectangle.toString()+"__"+fractal.currentDrawing.iters+".jpg";
  
  jpg.download = fileName;
  // Save JPG , must modify it's exif metadata tags, somehow... filename trick inadequate
  //Piexifjs is available as a Node.js package and can be installed by using npm as shown below:
  jpg.click();
  document.body.removeChild(jpg);
 console.log("M,"+fractal.currentDrawing.iters+","+zoomFactor+","+rect.iMin+","+rect.iMax+","+rect.rMin+","+rect.rMax);
});

maxIterationsInput.addEventListener("change", () =>
{
  maxIterations = maxIterationsInput.value;
});

canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mousedown", mouseDown);

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function mouseDown( e )
{
  let pos = getMousePos(canvas, e);
  zoom_x1=pos.x;
  zoom_y1=pos.y;
  let zoom = new PixelRectangle(0,0,canvas.width,canvas.height);
  fractal.currentDrawing.zoomRectangle = zoom;    
}

function mouseUp( e )
{
   let pos = getMousePos(canvas, e);
   let zoom_x2 = pos.x;
   let zoom_y2 = pos.y;
 
   let zoom = makePixelRectangle( zoom_x1, zoom_x2, zoom_y1, zoom_y2 );
   drawXORRectangle( zoom );
   fractal.currentDrawing.zoomRectangle = zoom;
}

function  drawXORRectangle( rect )
{
    canvasContext.globalCompositeOperation = 'xor';
    canvasContext.strokeRect( rect.x1, rect.y1, rect.w, rect.h ); 
    canvasContext.stroke();
}
 
function makePixelRectangle( _x1, _x2, _y1, _y2 )
{
    let x_ul = 0;
    let y_ul = 0;
    let width = 0;
    let height = 0;

    if( _x1 > _x2 )
    {
      x_ul = _x2;
      width = _x1 - _x2;
    }
    else
    {
      x_ul = _x1;
      width = _x2 - _x1;
    }
    if( _y1 > _y2 )
    {
      y_ul = _y2;
      height = _y1 - _y2;
    }
    else
    {
      y_ul = _y1;
      height = _y2 - _y1;
    }
    return new PixelRectangle( x_ul, y_ul, width, height );
}  


