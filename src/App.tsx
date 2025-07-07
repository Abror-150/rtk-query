import "./App.css";
import Stack from "./stack";

export interface StackType {
  id: number;
  name: string;
  createdAt: string;
  image: string;
}

function App() {
  return <Stack />;
}

export default App;
