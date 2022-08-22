
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const Content = styled.div`
    font-family: sans-serif;
`

const Navbar = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    border-bottom: 1px solid #e6e6e6;
    align-items: center;
    justify-content: center;
`

const NavbarContent = styled.div`
    max-width: 840px;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
`

const Logo = styled.img`
    width: 180px;
    cursor: pointer;
    height: auto;
`

const SearchBar = styled.input`
    height: 1em;
    margin-inline: 20px;
`

const SearchButton = styled.button`
    
`

const SearchResults = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 750px;
    width: 100%;
    margin: auto;
`

const SearchResult = styled.div`
    display: flex;
    flex-direction: column;
`

const SearchResultLink = styled.a`
    text-decoration: none;
    font-size: 1.1rem;
    margin: 0;
    width: fit-content;

    &:hover {
        text-decoration: underline;
    }
`

const SearchResultURL = styled.p`
    font-size: 0.9rem;
    color: green;
    margin: 0;
    margin-bottom: 5px;
`

const SearchDescription = styled.p`
    color: #111;
    line-height: 1.2em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
            line-clamp: 3; 
    -webkit-box-orient: vertical;
    margin-left: 20px;
    margin-top: 0;
`

const Message = styled.p`
    font-size: 0.9rem;
    color: #222;
    margin: 7px;
`

const Subheader = styled.p`
    margin: 4px;
`

type LoadingState = "loading" | "success" | "error";

const SearchResultsPage = () => {
    const search = useLocation().search;
    const name: string = new URLSearchParams(search).get("term") as string;
    const [results, setResults] = useState([]);
    const [loadTime, setLoadTime] = useState(0);
    const [searchTerm, setSearchTerm] = useState<string>(name);
    const [state, setState] = useState<string>("loading");

    const navigate = useNavigate();

    useEffect(() => {
        // perform search on the API to get results
        axios.get(`http://localhost:4000/api/search?term=${name}`).then(res => {
            console.log(res.data);
            setResults(res.data.results);
            setState("success");
            setLoadTime(res.data.time);
        }).catch(err => {
            setState("error");
        });
    }, [name]);

    return (
        <Content>
            <Navbar>
                <NavbarContent>
                    <Logo src={require("../assets/logo.png")} onClick={() => {navigate('/');}}/>
                    <SearchBar placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                    <SearchButton onClick={() => {navigate(`/search?term=${searchTerm}`)}}> Search </SearchButton>
                </NavbarContent>
            </Navbar>
            {
                state === "loading" &&
                    <Message>Loading...</Message>
            }
            {
                state === "error" && 
                    <Message>An error has occurred</Message>
            }
            {
                state === "success" &&
                <SearchResults>
                    <Subheader>
                        Here are the top results for <strong>{name}</strong>
                    </Subheader>
                    <>
                        {
                            results.length === 0 && (
                                <Message>No results found</Message>
                            )
                        }
                        {
                            results.length > 0 && (
                                <Message> Found {results.length} results in {Math.round(loadTime / 100) / 10} seconds </Message>
                            )
                        }
                        {results.map((result: any) => (
                            <SearchResult key={result.id}>
                                <SearchResultLink href={result.url}>{result.title}</SearchResultLink>
                                <SearchResultURL>{result.url}</SearchResultURL>
                                <SearchDescription>
                                    {result.content}
                                </SearchDescription>
                            </SearchResult>
                        ))}
                    </>
                </SearchResults>
            }
        </Content>
    )
}

export default SearchResultsPage;