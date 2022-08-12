import { Route, Routes } from "react-router-dom";
import SearchPage from "./SearchPage";
import SearchResultsPage from "./SearchResultsPage";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
        </Routes>
    )
}

export default App;