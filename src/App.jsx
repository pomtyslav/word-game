import Game from "./Game";
import "./App.css";

function App() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Reverse Wordle</h1>
        <Game />
      </div>
    </div>
  );
}

export default App;