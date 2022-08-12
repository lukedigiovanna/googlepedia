
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Logo = styled.img`
    width: 500px;
    margin-bottom: 50px;

    @media (max-width: 750px) {
        width: 350px;
    }
`

const MainContainer = styled.div`
    display: flex;
    margin-top: 200px;
    flex-direction: column;
    align-items: center;
`


const SearchArea = styled.div`
    display: flex;
    flex-direction: row;
    max-width: 500px;
    width: 100%;
`

const SearchInput = styled.input`
    flex: 5;
    margin-right: 20px;
    font-size: 1.2rem;
    font-family: 'Roboto', sans-serif;
`

const SearchButton = styled.button`
    flex: 1;
    transition: all 0.2s ease-in-out;
`

const SearchPage = () => {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    return (
        <MainContainer>
            <Logo src={require("../assets/logo.png")} />
            <SearchArea>
                <SearchInput onChange={e => setSearch(e.target.value)} />
                <SearchButton onClick={() => {navigate(`/search?term=${search}`)}} disabled={search.length === 0}>Search</SearchButton>
            </SearchArea>
        </MainContainer>
    )
}

export default SearchPage;