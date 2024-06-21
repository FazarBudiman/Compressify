import { BrowserRouter, Route, Routes } from "react-router-dom";
import Compression from "./pages/Compression";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Compression />} />
        {/* <Route path="/compress-audio" element={<Compression />} /> */}
      </Routes>
    </BrowserRouter>
  );
};
export default App;
