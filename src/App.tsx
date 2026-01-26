// src/App.tsx
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen font-['Nunito',system-ui,sans-serif]">
      <Outlet />
    </div>
  );
}

export default App;