import React, { useState } from 'react';
import { Copy, Download, Globe2, Languages, Link, Loader } from 'lucide-react';

const LanguageOption = ({ lang, name, selected, onSelect }) => (
  <div
    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 ${
      selected ? 'border-blue-600 bg-blue-100' : 'border-gray-200'
    }`}
    onClick={() => onSelect(lang)}
  >
    {name}
  </div>
);

const WebsiteTranslator = () => {
  const [url, setUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ta', name: 'Tamil' },
    { code: 'hi', name: 'Hindi' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'te', name: 'Telugu' },
  ];

  const displayToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const translateText = async (text, targetLang) => {
    try {
      const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(translateUrl);
      const data = await response.json();
      return data[0].map(x => x[0]).join('');
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  const translateWebsite = async () => {
    if (!url) {
      displayToast('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setTranslatedContent('');

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc.querySelectorAll('script').forEach(el => el.remove());

      const walker = document.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      const textNodes = [];
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          textNodes.push(node);
        }
      }

      for (let node of textNodes) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          try {
            const translated = await translateText(text, selectedLanguage);
            node.textContent = translated;
          } catch (e) {
            console.error('Translation error:', e);
          }
        }
      }

      doc.querySelectorAll('img, link[rel="stylesheet"], script').forEach(el => {
        if (el.src) {
          el.src = new URL(el.src, url).href;
        }
        if (el.href) {
          el.href = new URL(el.href, url).href;
        }
      });

      setTranslatedContent(doc.body.innerHTML);
      displayToast('Translation completed successfully!');
    } catch (error) {
      displayToast(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(translatedContent);
    displayToast('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([translatedContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translated-content.html';
    a.click();
    window.URL.revokeObjectURL(url);
    displayToast('Content downloaded successfully!');
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8 p-8 bg-white rounded-2xl shadow-md">
        <div className="text-4xl font-bold text-blue-600 mb-4 flex items-center justify-center gap-2">
          <Languages className="w-10 h-10" /> Quadra Translate
        </div>
        <div className="text-gray-600 text-lg">
          Translate entire websites into multiple languages instantly
        </div>
      </div>

      {/* Translator Card */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
        {/* URL Input */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
            <Link className="w-4 h-4" /> Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Enter the website URL you want to translate"
          />
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
            <Globe2 className="w-4 h-4" /> Target Language
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 mb-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Search languages..."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredLanguages.map((lang) => (
              <LanguageOption
                key={lang.code}
                lang={lang.code}
                name={lang.name}
                selected={selectedLanguage === lang.code}
                onSelect={setSelectedLanguage}
              />
            ))}
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={translateWebsite}
          className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-300"
        >
          <Languages className="w-5 h-5" /> Translate Website
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-8">
          <Loader className="w-10 h-10 mx-auto mb-4 animate-spin text-blue-600" />
          <div className="text-lg mb-2">Translating your website...</div>
          <div className="text-gray-600">This may take a few moments</div>
        </div>
      )}

      {/* Results */}
      {translatedContent && (
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200">
            <h2 className="text-2xl font-semibold">Translated Content</h2>
            <div className="flex gap-4">
              <button
                onClick={copyContent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-300"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={downloadContent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-300"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
          <div
            className="max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-lg"
            dangerouslySetInnerHTML={{ __html: translatedContent }}
          />
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-8 py-4 rounded-lg shadow-lg animate-slide-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default WebsiteTranslator;