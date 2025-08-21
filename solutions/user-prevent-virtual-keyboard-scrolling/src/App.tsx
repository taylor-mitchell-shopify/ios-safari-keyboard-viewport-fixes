import './App.css'
import { usePreventVirtualKeyboardScrolling } from './usePreventVirtualKeyboardScrolling';

function App() {
  usePreventVirtualKeyboardScrolling();

  return (
    <>
    <header className="sticky-header">
        <h1>Sticky Header</h1>
    </header>
    
    <div className="content">
        <input type="text" placeholder="Focus me to trigger iOS issue" />
    </div>
    </>
  )
}

export default App
