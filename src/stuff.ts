import './App';
import LM from 'ml-levenberg-marquardt';
import LM2 from 'ml-levenberg-marquardt-m93a/src';


export function setUpdateCallback(fn: ()=>void){ forceUpdate = fn; }
export let forceUpdate = () => {};

export let points: number[][] = [[],[],[],[]];
export let fitFn: LM.FittedFunction & LM2.FittedFunction = a => x => 0;
export let parameters = [1, 1];
export let range = {
  x: [-1, 10],
  y: [-7, 7]
};

export const steps = 200;

export const fitOptions = {
  initialValues: parameters
};

export const abData: Plotly.Data[] = [];
export const abPoints: number[][] = [[],[]];


const π  = Math.PI;
const π2 = Math.PI * 2;

export function randomN(mean: number, sigma: number) {
  let u = 0;
  let v = 0;

  while(u === 0) { u = Math.random(); }
  while(v === 0) { v = Math.random(); }

  return mean + sigma * Math.sqrt( -2 * Math.log(u) ) * Math.cos( π2 * v );
}

export function randomU(min: number, max: number) {
  return min + (max-min) * Math.random();
}

export function randomC(median: number, gamma: number) {
  return median + gamma * Math.tan( π * ( Math.random() - 0.5 ) );
}







export const LAYER_DATA = 0;
export const LAYER_ORIGINAL_FN = 1;
export const LAYER_OLD_LM = 2;
export const LAYER_NEW_LM = 3;
export const LAYER_MONTE_CARLO = 4;


export const data = new class extends Array {
  [LAYER_DATA] = new class {
    name = "Data";
    visible = false;

    x = [] as number[];
    y = [] as number[];

    error_x = new class {
      readonly type = 'data';
      readonly color = 'black';
      array = [] as number[];
    };

    error_y = new class {
      readonly type = 'data';
      readonly color = 'black';
      array = [] as number[];
    };

    readonly type = 'scatter';
    readonly mode = 'markers';
  };

  [LAYER_ORIGINAL_FN] = new class {
    name = "Original function";
    visible = false;

    x = [] as number[];
    y = [] as number[];

    readonly type = 'scatter';
    readonly mode = 'lines';
    readonly ['line.color'] = 'black';
  };

  [LAYER_OLD_LM] = new class {
    name = "Old LM (without EIV)";
    visible = false;

    x = [] as number[];
    y = [] as number[];

    readonly type = 'scatter';
    readonly mode = 'lines';
    readonly ['line.color'] = 'black';
  };

  [LAYER_NEW_LM] = new class {
    name = "Improved LM with EIV";
    visible = false;

    x = [] as number[];
    y = [] as number[];

    readonly type = 'scatter';
    readonly mode = 'lines';
    readonly ['line.color'] = 'black';
  };

  [LAYER_MONTE_CARLO] = new class {
    name = "Monte Carlo from Improved LM without EIV";
    visible = false;

    x = [] as number[];
    y = [] as number[];

    readonly type = 'scatter';
    readonly mode = 'lines';
    readonly ['line.color'] = 'black';
  };
};



export const loadFunction = () => {
  parameters =
    (document.getElementById('parameters') as HTMLInputElement)
    .value.split(',').map( x => +x );

  const fn = (0,eval)( "([a,b]) => x => " + (document.getElementById('function') as HTMLInputElement).value );
  if (typeof fn !== 'function' || typeof fn([]) !== 'function') { return alert('Invalid function supplied'); }

  fitFn = fn;
};


export const generateData = () =>
{
  const layer  = data[LAYER_DATA];
  const layer2 = data[LAYER_ORIGINAL_FN];
  if (layer.visible)
  {
    layer.visible = layer2.visible = false;
    forceUpdate();
    return;
  }
  layer.visible = layer2.visible = true;

  loadFunction();

  const fn = fitFn(parameters);

  const x: number[] = [];
  const y: number[] = [];
  const xErr: number[] = [];
  const yErr: number[] = [];

  for (let i = 0; i < 5; i++) {
    xErr[i] = Math.abs(randomC(0, .2));
    yErr[i] = Math.abs(randomC(0, .2));
    x[i] = randomN(i*2,     xErr[i]);
    y[i] = randomN(fn(i*2), yErr[i]);
  }

  points = [x, y, xErr, yErr];

  Object.assign( data[LAYER_DATA], { x, y } );

  data[LAYER_DATA].error_x.array = xErr;
  data[LAYER_DATA].error_y.array = yErr;


  plotFunction(q => fn(q), LAYER_ORIGINAL_FN, {visible: true});
}

export const fit = () =>
{
  const layer = data[LAYER_OLD_LM];
  if (layer.visible)
  {
    layer.visible = false;
    forceUpdate();
    return;
  }
  layer.visible = true;

  loadFunction();

  const pts = {
    x: points[0],
    y: points[1]
  };

  const options = {
    damping: 0.1,
    initialValues: parameters
  };

  const result = LM(pts, fitFn, options);
  console.log(result);

  plotFunction(fitFn(result.parameterValues), LAYER_OLD_LM);
};

export const fit2 = () =>
{
  const layer = data[LAYER_NEW_LM];
  if (layer.visible)
  {
    layer.visible = false;
    forceUpdate();
    return;
  }
  layer.visible = true;

  loadFunction();

  const pts = {
    x: points[0],
    y: points[1],
    xError: points[2],
    yError: points[3],
    
  };

  const options = {
    initialValues: parameters,
    errorPropagation: {
      rough: 50
    }
  };

  const result = LM2(pts, fitFn, options);
  console.log(result);

  plotFunction(fitFn(result.parameterValues), LAYER_NEW_LM);
};



export const plotFunction: {
  (fn: (x: number) => number, i?: number, options?: Plotly.Data): number;
  (fn: (x: number) => number, options: Plotly.Data): number;
}
= (fn: (x: number) => number, iOrOptions?: number | Plotly.Data, options?: Plotly.Data) => {

  // Argument overloading
  
  let i: number;

  if (typeof iOrOptions === "number"){
    i = iOrOptions;
  } else {
    i = data.length;

    if (typeof iOrOptions === "object")
    {
      options = iOrOptions;
    }
  }


  // Function body

  const pts: number[][] = [[],[]];
  const low = range.x[0];
  const hi  = range.x[1];
  const step = (hi - low)/steps;

  for (let x = low; x <= hi; x += step)
  {
    pts[0].push(x);
    pts[1].push(fn(x));
  }

  if (typeof data[i] !== 'object') data[i] = {};

  Object.assign(data[i], {
    x: pts[0],
    y: pts[1],
    ...options
  });

  forceUpdate();

  return i;
}

export const monteCarlo = () => {
  const layer = data[LAYER_MONTE_CARLO];
  if (layer.visible)
  {
    layer.visible = false;
    forceUpdate();
    return;
  }
  layer.visible = true;

  const xs = points[0];
  const ys = points[1];
  const us = points[2];
  const vs = points[3];

  for (let i = 0; i < 1000; i++)
  {
    const pts = {
      x: xs.map( (x,j) => randomN(x, us[j]) ),
      y: ys.map( (y,j) => randomN(y, vs[j]) )
    };

    const options = {
      initialValues: parameters,
      errorPropagation: {
        rough: 50
      }
    };

    const result = LM2(pts, fitFn, options);

    abPoints[0].push( result.parameterValues[0] );
    abPoints[1].push( result.parameterValues[1] );
  }

  const l = abPoints[0].length;

  const avgParams = [
    abPoints[0].reduce( (Σ,a) => Σ + a ) / l,
    abPoints[1].reduce( (Σ,a) => Σ + a ) / l
  ];

  abData[0] = {
    name: "a vs b",
    x: abPoints[0],
    y: abPoints[1],
    type: 'scatter',
    mode: 'markers',
  };

  plotFunction(fitFn(avgParams), LAYER_MONTE_CARLO);
}
