import { BrowserRouter, Route, Routes } from "react-router-dom";
import Compression from "./pages/Compression";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Compression />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
