import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { withAuthenticationRequired } from "@auth0/auth0-react";

function Search() {
  const [baseURL, setBaseURL] = useState("");
  const [query, setQuery] = useState("");
  const [jobID, setJobID] = useState();
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      let formattedBaseURL = baseURL;
      //if (formattedBaseURL.slice(0, 4) !== "http") {
      //  formattedBaseURL = "https://" + formattedBaseURL;
      //}
      //if (formattedBaseURL.slice(-1) !== "/") {
      //  formattedBaseURL = formattedBaseURL + "/";
      //}
      setBaseURL(formattedBaseURL);

      // URL encode baseURL and query
      const encodedBaseURL = encodeURIComponent(formattedBaseURL);
      const encodedQuery = encodeURIComponent(query);
      fetch(`http://192.168.199.97:5000/search?baseURL=${encodedBaseURL}&query=${encodedQuery}`, { method: "POST" })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setJobID(data.jobId);
          refetch();
        });
        
    }
  }

  const { data, error, loading, refetch } = useQuery({ queryKey: ["search"], queryFn: 
    async () => {
      const response = await fetch(`http://192.168.199.97:5000/checkDocumentStatus?jobId=${jobID}`);
      const data = await response.json();
      if (data.status !== "Complete") {
        setMessage("Working on request...")
        throw new Error("Not complete");
      }
      return data;
    },
    retryDelay: 10000,
    retry: 40,
    enabled: !!jobID,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      const content = JSON.parse(data.content);
      const results = content.matches;
      setMessage("");
      setResults(results);
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="">Search</h1>
      <form onSubmit={handleSearch} className="flex flex-col gap-5">
        <input
          className="h-10"
          type="text"
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
          placeholder="Base Docs URL"
        />
        <input
          className="h-10"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Query"
        />
        <button type="submit">Search</button>
      </form>
      {results && results.map((result) => {
        return (
          <div className="result">
            <h3><a href={result.metadata.url}>{result.metadata.title}</a></h3>
            <p>{result.metadata.content}</p>
          </div>
        );
      })
      }
      {message && <p>{message}</p>}
    </div>
  );
}

export default Search;//withAuthenticationRequired(Search);