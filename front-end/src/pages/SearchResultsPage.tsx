
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const SearchResultsPage = () => {
    const search = useLocation().search;
    const name = new URLSearchParams(search).get("term");
    const [results, setResults] = useState([]);

    useEffect(() => {
        // perform search on the API to get results
        axios.get(`http://localhost:4000/api/search?term=${name}`).then(res => {
            console.log(res.data);
            setResults(res.data);
        });
    }, []);

    return (
        <div>
            <h1>Search Results</h1>
            <p>
                Here are all the results for <strong>{name}</strong>
            </p>
            <ul>
                {results.map((result: any) => (
                    <li key={result.id}>
                        <a href={result.url}>{result.title}</a>
                    </li>
                ))}
            </ul>
            {
                results.length === 0 && (
                    <p>No results found</p>
                )
            }
        </div>
    )
}

export default SearchResultsPage;