import * as React from 'react';
import Plot from 'react-plotly.js';
import './App.css';

import * as S from './stuff';






class App extends React.Component {

  public render()
  {
    S.setUpdateCallback( ()=>this.forceUpdate() );

    return (
      <div className="App">
        <p className="App-intro">
          <Plot
            data={S.data}
            config={{staticPlot: true}}
            layout={{
              width: 800,
              height: 600,
              title: 'A Plot',
              xaxis: {range: S.range.x},
              yaxis: {range: S.range.y}
            }}
          />
          <Plot
            data={S.abData}
            config={{staticPlot: true}}
            layout={{
              width: 400,
              height: 600,
              title: 'a vs b'
            }}
          />
          <br/>
          <input id="function" defaultValue="a*Math.sin(b*x)" />
          <br/>
          <input id="parameters" defaultValue="5, 0.5" />
          <br/>
          <button onClick={S.generateData}>1. Generate data</button>
          <button onClick={S.fit}>2. Fit with old LM</button>
          <button onClick={S.fit2}>3. Fit with improved LM</button>
          <button onClick={S.monteCarlo}>4. Monte Carlo</button>
        </p>
      </div>
    );
  }
}

export default App;
