import SensorySketchpad from './components/SensorySketchpad';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/main.css';

function App() {
  return (
    <div role="application" aria-label="Sensory Sketchpad - Interactive Music Drawing Application">
      <ErrorBoundary>
        <SensorySketchpad />
      </ErrorBoundary>
    </div>
  );
}

export default App;