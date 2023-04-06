import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import 'tailwindcss/tailwind.css';

const Toast = ({ showToast, message }) => {
  return (
    <>
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md transition-all duration-300 ease-in-out">
          {message}
        </div>
      )}
    </>
  );
};

const IndexPage = () => {
  const [keywords, setKeywords] = useState('');
  const [startupNames, setStartupNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const aiRef = useRef(null);

  useEffect(() => {
    const waitForAI = async () => {
      let timeoutCounter = 0;
      while (!window.ai) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        timeoutCounter += 100;
        if (timeoutCounter >= 1000) {
          setShowPopup(true);
          break;
        }
      }
      aiRef.current = window.ai;
    };
    waitForAI();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (aiRef.current) {
      setIsLoading(true);
      const userQuery = `Based on this startup's keywords/description, create 6 unique and clever startup names. You are Silicon Valley's best startup namer, so make this interesting. keywords/description: ${keywords}\n\nRemember, you can only respond in JSON.`;

      try {
        const result = await aiRef.current.getCompletion(
          {
            messages: [
              {
  "role": "system",
  "content": "JSON responses only. RESPONSE FORMAT: { \"startupNames\": [\n    \"name1\",\n    \"name2\",\n    \"name3\",\n    \"name4\",\n    \"name5\",\n\"name6\"\n  ]\n}"
},
              { role: 'user', content: userQuery }],
          },
        );
        try {
          const jsonResponse = JSON.parse(result.message.content);
          console.log(jsonResponse)
          setStartupNames(jsonResponse.startupNames);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } catch (error) {
        console.error('Error in getting completion:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCopyClick = (text) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 flex items-center">
      <Head>
        <title>Startup Name Generator</title>
      </Head>

      <div className="container mx-auto px-4 py-5">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-semibold mb-5">Startup Name Generator</h1>
{/* align items */}
          <form onSubmit={handleSubmit} className="mb-5 flex flex-col">
            <label htmlFor="keywords" className="block mb-2 text-lg font-semibold">
             what is your startup about? (keywords, description, etc.)
            </label>
            {/* make all elements the same height */}
            <div className="flex flex-col sm:flex-row">
              <input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="border border-gray-300 rounded-lg p-3 mb-2 sm:mb-0 sm:mr-4 transition-all duration-300 ease-in-out w-full"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded ml-4 transition-all duration-300 ease-in-out w-64"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="text-md"
                  >Loading...</div>
                ) : (
                  <div className="text-md"
                  >Generate Names</div>
                )}
              </button>
            </div>
          </form>

          {startupNames.length > 0 && (
            <div>
              <h3 className='text-md mb-3'>Click on a name to copy it!</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {startupNames.map((name, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 hover:bg-gray-200 text-black p-5 rounded-lg shadow-md cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => handleCopyClick(name)}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast showToast={showToast} message="Copied to Clipboard" />
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              window.ai not detected
            </h2>
            <p className="mb-4">
              Please install window.ai from{' '}
              <a
                href="https://windowai.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                windowai.io
              </a>
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-all duration-300 ease-in-out"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexPage;