import React from 'react'

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar">
      <img src="search.svg" alt="Search" />
      <input
        type="text"
        placeholder="Search movies, universes, directors..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      {searchTerm && (
        <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
          Clear
        </button>
      )}
    </div>
  )
}

export default Search
