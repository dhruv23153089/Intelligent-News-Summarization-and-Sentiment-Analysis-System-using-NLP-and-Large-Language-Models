import {
  Activity,
  BarChart3,
  Bot,
  Download,
  FileText,
  Globe2,
  History,
  Loader2,
  Moon,
  Play,
  Search,
  Send,
  Sparkles,
  Sun,
  Upload,
  Volume2,
  ArrowRight,
  Check,
  TrendingUp,
  BookOpen,
  Trash2,
  RefreshCw
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  analyzeArticle,
  askQuestion,
  fetchLatestNews,
  fetchUrl,
  uploadArticle,
} from './api';

// Fallback high-quality editorial articles for the Discover view
const SAMPLE_DISCOVER_ARTICLES = [
  {
    id: 101,
    title: 'EU passes landmark AI Act setting global regulatory standards',
    source: 'Tech Reuters',
    time: '24 min ago',
    category: 'Technology',
    sentiment: { label: 'Neutral', confidence: 78, scores: { Positive: 25, Neutral: 78, Negative: 12 } },
    summary: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence. The law classifies systems by risk levels, imposing strict transparency and safety standards on high-risk foundation models while banning certain intrusive practices.',
    summaries: {
      short: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence.',
      medium: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence. The law classifies systems by risk levels, imposing strict transparency and safety standards on high-risk foundation models.',
      detailed: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence. The legislation imposes strict transparency and safety standards on high-risk foundation models while banning certain intrusive practices.',
      extractive_textrank: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence.',
      extractive_lexrank: 'The law classifies systems by risk levels, imposing strict transparency and safety standards on high-risk foundation models.'
    },
    text: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence. The legislation, which has been in negotiation for several years, classifies systems by risk levels, imposing strict transparency and safety standards on high-risk foundation models while banning certain intrusive practices. Under the new rules, developers of large-scale models must undergo safety evaluations, report energy usage, and verify compliance with copyright laws. Civil rights groups have praised the bans on real-time biometric surveillance, though some industry leaders warn the regulatory burden could slow European innovation. The standards are expected to take effect in phases over the next two years, influencing AI governance structures globally.',
    tags: ['AI', 'Regulation', 'Policy', 'Europe'],
    keywords: ['AI Act', 'European Parliament', 'Regulation', 'Safety', 'Compliance'],
    key_phrases: ['comprehensive legal framework', 'high-risk foundation models', 'biometric surveillance'],
    entities: {
      ORGANIZATION: ['European Parliament', 'Tech Reuters'],
      POLICY: ['AI Act'],
      LOCATION: ['Europe']
    },
    statistics: { word_count: 145, sentence_count: 6, compression_ratio: 42, summary_word_count: 55 },
    fake_news_probability: { probability: 2, label: 'Very Low Risk' }
  },
  {
    id: 102,
    title: 'Global markets rally as inflation cools below federal target',
    source: 'Financial Times',
    time: '1 hour ago',
    category: 'Business',
    sentiment: { label: 'Positive', confidence: 88, scores: { Positive: 88, Neutral: 10, Negative: 2 } },
    summary: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%, dropping below the central bank target. Economists predict the interest rate cuts will follow next month, boosting corporate investments across tech and energy sectors.',
    summaries: {
      short: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%, dropping below the central bank target.',
      medium: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%, dropping below the central bank target. Economists predict interest rate cuts next month.',
      detailed: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%, dropping below the central bank target. Economists predict interest rate cuts will follow next month, boosting corporate investments across tech and energy sectors.',
      extractive_textrank: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%.',
      extractive_lexrank: 'Economists predict the interest rate cuts will follow next month.'
    },
    text: 'Major financial indexes jumped today after newly released economic data showed inflation fell to 1.9%, dropping below the central bank target. Economists predict the interest rate cuts will follow next month, boosting corporate investments across tech and energy sectors. The Federal Reserve chairman hinted that the central bank is prepared to shift its focus from inflation control to supporting employment growth. Consumer spending indexes have also demonstrated robust strength, indicating a soft landing for the global economy. Critics point out that housing costs remain stubbornly high, which could pressure lower-income households despite the overall optimistic market trends. Global bond yields fell as investors reacted to the news.',
    tags: ['Markets', 'Inflation', 'Economy', 'Finance'],
    keywords: ['Inflation', 'Interest Rates', 'Federal Reserve', 'Bond Yields', 'Markets'],
    key_phrases: ['cooling inflation rate', 'interest rate adjustments', 'soft landing'],
    entities: {
      ORGANIZATION: ['Federal Reserve', 'Financial Times'],
      LOCATION: ['United States']
    },
    statistics: { word_count: 120, sentence_count: 6, compression_ratio: 45, summary_word_count: 48 },
    fake_news_probability: { probability: 4, label: 'Very Low Risk' }
  },
  {
    id: 103,
    title: 'NASA Mars lander discovers ancient liquid water reservoir markers',
    source: 'Space Science',
    time: '3 hours ago',
    category: 'Science',
    sentiment: { label: 'Positive', confidence: 92, scores: { Positive: 92, Neutral: 7, Negative: 1 } },
    summary: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface, suggesting liquid water reservoirs persisted for millions of years longer than previously estimated, reshaping search strategies for ancient biosignatures.',
    summaries: {
      short: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface.',
      medium: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface, suggesting liquid water reservoirs persisted for millions of years longer than estimated.',
      detailed: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface, suggesting liquid water reservoirs persisted for millions of years longer than previously estimated, reshaping search strategies for ancient biosignatures.',
      extractive_textrank: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface.',
      extractive_lexrank: 'These mineral markers were analyzed using the onboard spectrometer in the Utopia Planitia basin.'
    },
    text: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface, suggesting liquid water reservoirs persisted for millions of years longer than previously estimated. These mineral markers were analyzed using the onboard spectrometer in the Utopia Planitia basin, a vast plain known for geological anomalies. The discovery indicates that early Mars had a much thicker atmosphere and active hydrological cycles that sustained surface water. Planetary scientists claim this drastically increases the likelihood of micro-fossils or biosignatures being preserved in shallow rock layers, providing a targeted excavation map for future crewed missions. The mission planning team is currently adjusting the rover route to prioritize these mineral-rich sediment beds.',
    tags: ['Mars', 'NASA', 'Water', 'Space', 'Discovery'],
    keywords: ['Mars', 'NASA', 'Robotic Lander', 'Spectrometer', 'Biosignatures'],
    key_phrases: ['hydrated mineral markers', 'subterranean reservoirs', 'geological anomalies'],
    entities: {
      ORGANIZATION: ['NASA'],
      LOCATION: ['Mars', 'Utopia Planitia']
    },
    statistics: { word_count: 135, sentence_count: 5, compression_ratio: 38, summary_word_count: 52 },
    fake_news_probability: { probability: 1, label: 'Very Low Risk' }
  },
  {
    id: 104,
    title: 'Global climate coalition commits to unified ocean protection treaty',
    source: 'World Environment',
    time: '5 hours ago',
    category: 'World',
    sentiment: { label: 'Positive', confidence: 81, scores: { Positive: 81, Neutral: 15, Negative: 4 } },
    summary: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva. The pact establishes marine protected zones covering 30% of global international waters, aiming to ban commercial fishing and deep-sea mining in critical ecosystems by 2030.',
    summaries: {
      short: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva.',
      medium: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva establishing marine protected zones covering 30% of global international waters.',
      detailed: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva. The pact establishes marine protected zones covering 30% of global international waters, aiming to ban commercial fishing and deep-sea mining in critical ecosystems by 2030.',
      extractive_textrank: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva.',
      extractive_lexrank: 'The pact establishes marine protected zones covering 30% of global international waters.'
    },
    text: 'Representatives from 120 countries have signed a historic ocean protection treaty in Geneva. The pact establishes marine protected zones covering 30% of global international waters, aiming to ban commercial fishing and deep-sea mining in critical ecosystems by 2030. The agreement establishes a shared international policing fund to monitor compliance via satellite surveillance and naval patrols. While marine biologists have hailed the treaty as a turning point for ocean biodiversity, several coastal nations voiced concerns about the impact on local fishing fleets and economies. Industry lobbies have also criticized the deep-sea mining moratorium, arguing it delays the extraction of battery metals. Nonetheless, the treaty represents the largest collective environmental protection milestone in decades.',
    tags: ['Climate', 'Ocean', 'Treaty', 'Environment', 'World'],
    keywords: ['Ocean Treaty', 'Geneva', 'Environment', 'Moratorium', 'Biodiversity'],
    key_phrases: ['marine protected zones', 'deep-sea mining moratorium', 'ocean biodiversity'],
    entities: {
      LOCATION: ['Geneva'],
      ORGANIZATION: ['World Environment']
    },
    statistics: { word_count: 142, sentence_count: 6, compression_ratio: 40, summary_word_count: 57 },
    fake_news_probability: { probability: 3, label: 'Very Low Risk' }
  }
];

const sampleArticle = `Artificial intelligence researchers and climate policy leaders met in New Delhi on 14 July 2026 to discuss how advanced forecasting systems can help governments respond to extreme weather. Officials said the initiative will combine satellite data, local reports, and machine learning models to predict floods and heat waves with greater accuracy. The Ministry of Earth Sciences said the system will first be tested in coastal regions before expanding to other parts of India. Several technology companies and universities, including public research labs, will contribute tools for data analysis and public alerts. Experts said the project could reduce economic losses and protect vulnerable communities if warnings reach citizens quickly. Some civil society groups urged the government to publish model limitations and protect personal data collected during emergency response. The pilot program is expected to begin later this year, with an independent review planned after six months.`;

const PROCESSING_STEPS = [
  'Reading article text...',
  'Understanding context and vocabulary...',
  'Extracting key terms and phrases...',
  'Generating extractive & abstractive summaries...',
  'Analyzing emotional tone and sentiment bias...',
  'Identifying primary category and topics...',
  'Mapping named entities and keywords...',
  'Preparing news intelligence metrics...'
];

function uniqueLiveArticles(articles) {
  const seenTitles = new Set();
  const seenUrls = new Set();

  return articles.filter((article) => {
    const title = (article.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const url = (article.url || article.link || '').trim().toLowerCase();
    if ((title && seenTitles.has(title)) || (url && seenUrls.has(url))) return false;
    if (title) seenTitles.add(title);
    if (url) seenUrls.add(url);
    return true;
  });
}

function App() {
  const [currentTab, setCurrentTab] = useState('discover'); // 'discover', 'intelligence', 'trending', 'analytics', 'saved'
  const [articleText, setArticleText] = useState(sampleArticle);
  const [title, setTitle] = useState('AI climate forecasting pilot announced in India');
  const [url, setUrl] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Advanced filters state
  const [filterSentiment, setFilterSentiment] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterLanguage, setFilterLanguage] = useState('All');
  
  // Core analysis states
  const [question, setQuestion] = useState('How will the system help?');
  const [qaHistory, setQaHistory] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  
  // Theme and History
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('history');
    if (saved) return JSON.parse(saved);
    // Prepopulate history with some analytical examples so analytics and comparison page work immediately
    return [
      {
        id: 1,
        title: 'NASA Mars lander discovers ancient liquid water reservoir markers',
        category: 'Science',
        sentiment: 'Positive',
        text: 'The NASA robotic lander has detected high concentrations of hydrated minerals beneath the Martian surface, suggesting liquid water reservoirs persisted for millions of years longer than previously estimated...',
        result: SAMPLE_DISCOVER_ARTICLES[2]
      },
      {
        id: 2,
        title: 'EU passes landmark AI Act setting global regulatory standards',
        category: 'Technology',
        sentiment: 'Neutral',
        text: 'The European Parliament has officially ratified the AI Act, establishing the first comprehensive legal framework for artificial intelligence. The law classifies systems by risk...',
        result: SAMPLE_DISCOVER_ARTICLES[0]
      }
    ];
  });
  
  const [summaryTab, setSummaryTab] = useState('medium');
  const [useAbstractive, setUseAbstractive] = useState(false);
  const [analyzerInputMode, setAnalyzerInputMode] = useState('text'); // 'text', 'url', 'file'

  // Processing step animation index
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [simulatedProcessing, setSimulatedProcessing] = useState(false);

  // Article comparison states
  const [compareArticleIds, setCompareArticleIds] = useState([]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  // Show temporary toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const entityCount = useMemo(() => {
    if (!result?.entities) return 0;
    return Object.values(result.entities).reduce((sum, items) => sum + items.length, 0);
  }, [result]);

  const canAnalyze = articleText.trim().split(/\s+/).length > 20;

  // Real-time animation simulator for high-fidelity processing state
  const runSimulatedProcessing = (onComplete) => {
    setSimulatedProcessing(true);
    setActiveStepIndex(0);
    
    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < PROCESSING_STEPS.length) {
        setActiveStepIndex(index);
      } else {
        clearInterval(interval);
        setSimulatedProcessing(false);
        setActiveStepIndex(-1);
        onComplete();
      }
    }, 280);
  };

  async function handleAnalyze() {
    if (!canAnalyze) {
      setError('Paste a longer article (at least 20 words) before analyzing.');
      return;
    }
    setLoading('analyze');
    setError('');
    setAnswer(null);
    setQaHistory([]);
    
    // Switch to Intelligence tab immediately so they see the progress
    setCurrentTab('intelligence');

    runSimulatedProcessing(async () => {
      try {
        const data = await analyzeArticle({ text: articleText, title, abstractive: useAbstractive });
        
        // Add fake news labels if missing
        if (!data.fake_news_probability) {
          data.fake_news_probability = { probability: 8, label: 'Low Risk' };
        }
        
        setResult(data);
        
        // Check if article already in history to avoid duplication
        setHistory((items) => {
          const exists = items.find(item => item.title === (title || data.headline_suggestions?.[0]));
          if (exists) return items;
          
          return [
            {
              id: Date.now(),
              title: title || data.headline_suggestions?.[0] || 'Untitled article',
              category: data.category || 'General',
              sentiment: data.sentiment?.label || 'Neutral',
              text: articleText,
              result: data
            },
            ...items
          ].slice(0, 8);
        });

        triggerToast('Article processed successfully');
      } catch (err) {
        setError(err.response?.data?.detail || 'Analysis failed. Check that the backend is running.');
      } finally {
        setLoading('');
      }
    });
  }

  // Pre-load an article from Discover directly into the Intelligence dashboard and run analysis
  const handleLoadAndAnalyze = (article) => {
    const textToAnalyze = article.text || article.description || article.summary || article.title || '';
    const titleToAnalyze = article.title || 'Selected Article';

    setTitle(titleToAnalyze);
    setArticleText(textToAnalyze);
    
    setLoading('analyze');
    setError('');
    setAnswer(null);
    setQaHistory([]);
    setCurrentTab('intelligence');
    setResult(null);
    
    runSimulatedProcessing(async () => {
      try {
        let data;
        if (article.summaries && article.sentiment?.scores) {
          data = article;
        } else {
          data = await analyzeArticle({ text: textToAnalyze, title: titleToAnalyze, abstractive: useAbstractive });
        }

        if (!data.fake_news_probability) {
          data.fake_news_probability = { probability: 8, label: 'Low Risk' };
        }
        
        setResult(data);
        setHistory((items) => {
          const exists = items.find(item => item.title === titleToAnalyze);
          if (exists) return items;
          return [
            {
              id: Date.now(),
              title: titleToAnalyze,
              category: data.category || article.category || 'General',
              sentiment: data.sentiment?.label || 'Neutral',
              text: textToAnalyze,
              result: data
            },
            ...items
          ].slice(0, 8);
        });
        triggerToast('Article analyzed successfully');
      } catch (err) {
        setError(err.response?.data?.detail || 'Analysis failed. Check that the backend is running.');
      } finally {
        setLoading('');
      }
    });
  };

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading('upload');
    setError('');
    try {
      const data = await uploadArticle(file);
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      setArticleText(data.text);
      triggerToast('Document text extracted');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not read that file.');
    } finally {
      setLoading('');
    }
  }

  async function handleFetchUrl() {
    if (!url.trim()) return;
    setLoading('url');
    setError('');
    try {
      const data = await fetchUrl(url);
      setTitle(data.title || 'Fetched article');
      setArticleText(data.text);
      triggerToast('URL content fetched');
    } catch (err) {
      setError(
        err.response?.data?.detail
        || (err.request
          ? 'The backend could not be reached. Confirm it is running on port 8000.'
          : `Could not fetch article text: ${err.message}`),
      );
    } finally {
      setLoading('');
    }
  }

  async function handleLatestNews(customQuery) {
    const targetQuery = typeof customQuery === 'string' ? customQuery : newsQuery;
    setLoading('latest');
    setError('');
    try {
      const data = await fetchLatestNews(targetQuery);
      const articles = uniqueLiveArticles(data.articles || []);
      setLatestNews(articles);
      triggerToast(`Fetched ${articles.length} unique articles for "${targetQuery || 'latest'}"`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not fetch latest news.');
    } finally {
      setLoading('');
    }
  }

  async function handleAsk() {
    if (!question.trim() || !articleText.trim()) return;
    
    // Add user query to chat history
    const userMsg = { sender: 'user', text: question };
    setQaHistory(prev => [...prev, userMsg]);
    
    setLoading('ask');
    setError('');
    
    try {
      const data = await askQuestion({ text: articleText, question });
      setAnswer(data);
      
      const assistantMsg = { 
        sender: 'assistant', 
        text: data.answer, 
        confidence: data.confidence,
        evidence: data.evidence 
      };
      setQaHistory(prev => [...prev, assistantMsg]);
      setQuestion('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Question answering failed.');
    } finally {
      setLoading('');
    }
  }

  function speakSummary() {
    if (!result?.summaries?.[summaryTab]) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.summaries[summaryTab]));
    triggerToast('Speaking summary');
  }

  function exportPdf() {
    window.print();
  }

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    triggerToast('Article deleted from workspace history');
  };

  // Categories list
  const categories = ['All', 'Technology', 'Business', 'World', 'Politics', 'Science', 'Health', 'Sports', 'Entertainment'];
  
  // Filter discovering news items based on global search & category pills
  const filteredDiscoverNews = useMemo(() => {
    return SAMPLE_DISCOVER_ARTICLES.filter((article) => {
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch = globalSearchQuery.trim() === '' || 
        article.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || 
        article.summary.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        (article.category && article.category.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        article.tags.some(t => t.toLowerCase().includes(globalSearchQuery.toLowerCase()));
      
      const matchesSentiment = filterSentiment === 'All' || article.sentiment.label === filterSentiment;
      const matchesSource = filterSource === 'All' || article.source.toLowerCase().includes(filterSource.toLowerCase());

      return matchesCategory && matchesSearch && matchesSentiment && matchesSource;
    });
  }, [selectedCategory, globalSearchQuery, filterSentiment, filterSource]);

  // Comparative values computation
  const comparisonResults = useMemo(() => {
    return compareArticleIds.map(id => {
      // search in discover or history
      const matched = SAMPLE_DISCOVER_ARTICLES.find(a => a.id === id) || 
                      history.find(h => h.id === id)?.result || 
                      (result && result.title === history.find(h => h.id === id)?.title ? result : null);
      return matched;
    }).filter(Boolean);
  }, [compareArticleIds, result, history]);

  // Analytics computation values
  const analyticsKPIs = useMemo(() => {
    const totalAnalyzed = history.length + (result ? 1 : 0);
    const positiveCount = history.filter(h => h.sentiment === 'Positive').length + (result?.sentiment?.label === 'Positive' ? 1 : 0);
    const neutralCount = history.filter(h => h.sentiment === 'Neutral').length + (result?.sentiment?.label === 'Neutral' ? 1 : 0);
    const negativeCount = history.filter(h => h.sentiment === 'Negative').length + (result?.sentiment?.label === 'Negative' ? 1 : 0);
    
    // Average confidence
    const allConfidence = [
      ...history.map(h => h.result?.sentiment?.confidence || 80),
      ...(result?.sentiment?.confidence ? [result.sentiment.confidence] : [])
    ];
    const avgConfidence = allConfidence.length > 0 
      ? Math.round(allConfidence.reduce((a, b) => a + b, 0) / allConfidence.length) 
      : 85;

    return {
      totalAnalyzed,
      positiveCount,
      neutralCount,
      negativeCount,
      avgConfidence,
      trendingTopics: ['Artificial Intelligence', 'Green Policy', 'NASA Mars Mission', 'Fintech Inflation']
    };
  }, [history, result]);

  return (
    <div className="app-shell">
      {/* Sticky Premium Navigation */}
      <header className="nav-bar">
        <div className="nav-logo">
          {/* Stylized custom logo with SVG of N + document + AI spark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#ff4f00"/>
            <path d="M9 22V10L14 16.5L19 10V22" stroke="#fffefb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 9L24.5 11.5L27 12L25 14L25.5 16.5L23 15L20.5 16.5L21 14L19 12L21.5 11.5L23 9Z" fill="#fffefb"/>
          </svg>
          <span style={{ fontFamily: 'Inter', letterSpacing: '-0.5px' }}>News Intelligence Studio</span>
        </div>
        
        {/* Tab Routing links */}
        <nav className="nav-links">
          <button 
            className={`nav-link ${currentTab === 'discover' ? 'active' : ''}`}
            onClick={() => setCurrentTab('discover')}
          >
            Discover
          </button>
          <button 
            className={`nav-link ${currentTab === 'intelligence' ? 'active' : ''}`}
            onClick={() => {
              setCurrentTab('intelligence');
              // Auto set result to null if they just want a clean screen
            }}
          >
            Intelligence
          </button>
          <button 
            className={`nav-link ${currentTab === 'trending' ? 'active' : ''}`}
            onClick={() => setCurrentTab('trending')}
          >
            Trending
          </button>
          <button 
            className={`nav-link ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`nav-link ${currentTab === 'saved' ? 'active' : ''}`}
            onClick={() => setCurrentTab('saved')}
          >
            Saved
          </button>
        </nav>

        {/* Navigation Action section */}
        <div className="nav-actions">
          {/* Global Search */}
          <div className="search-header-container">
            <Search 
              size={16} 
              style={{ cursor: 'pointer' }}
              title="Click or press Enter to fetch live news"
              onClick={() => {
                if (globalSearchQuery.trim()) {
                  if (currentTab !== 'discover') setCurrentTab('discover');
                  handleLatestNews(globalSearchQuery);
                }
              }} 
            />
            <input 
              className="text-input" 
              style={{ height: '36px', fontSize: '14px', borderRadius: '8px' }}
              value={globalSearchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setGlobalSearchQuery(query);
                setNewsQuery(query);
                if (currentTab !== 'discover' && currentTab !== 'saved') {
                  setCurrentTab('discover');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearchQuery.trim()) {
                  if (currentTab !== 'discover') setCurrentTab('discover');
                  handleLatestNews(globalSearchQuery);
                }
              }}
              placeholder="Search news & topics... (Press Enter to fetch live)"
            />
          </div>

          {/* Theme Toggle */}
          <button className="btn-icon" style={{ borderRadius: '8px', width: '36px', height: '36px' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Analyze Primary CTA */}
          <button 
            className="btn-primary" 
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}
            onClick={() => {
              setResult(null); // Force show the input analyzer
              setCurrentTab('intelligence');
            }}
          >
            <Sparkles size={14} />
            Analyze Article
          </button>
        </div>
      </header>

      {/* Global Error Banner */}
      {error && (
        <div className="container" style={{ paddingBottom: 0, paddingTop: '20px' }}>
          <div className="card-white" style={{ borderColor: 'var(--negative)', backgroundColor: 'var(--negative-bg)', padding: '12px 16px', color: 'var(--negative)', fontWeight: '600', borderRadius: '8px', display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <span>{error}</span>
            <button style={{ color: 'var(--negative)', fontWeight: 'bold' }} onClick={() => setError('')}>Dismiss</button>
          </div>
        </div>
      )}

      {/* Main Tab Render Workspace */}
      <div style={{ flexGrow: 1 }}>
        {currentTab === 'discover' && (
          <div className="container">
            {/* Header section */}
            <div className="editorial-header">
              <span className="eyebrow-uppercase">Discover Intelligence</span>
              <h1 className="display-md">Latest Briefings & Core Trends</h1>
              <p className="body-md">Explore pre-analyzed editorial briefings or query live global updates through our active machine learning framework.</p>
            </div>

            {/* Category pills */}
            <div className="category-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => {
                    const query = cat === 'All' ? '' : cat;
                    setSelectedCategory(cat);
                    setGlobalSearchQuery(query);
                    setNewsQuery(query);
                    if (query) {
                      handleLatestNews(query);
                    } else {
                      setLatestNews([]);
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* In-line live query bar */}
            <div className="card-content" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '260px' }}>
                <Globe2 size={18} style={{ color: 'var(--primary)' }} />
                <input 
                  className="text-input"
                  style={{ height: '40px' }}
                  value={newsQuery}
                  onChange={(e) => {
                    setNewsQuery(e.target.value);
                    setGlobalSearchQuery(e.target.value);
                  }}
                  placeholder="Fetch live news topic, e.g. fusion energy, chip shortage..."
                  onKeyDown={(e) => e.key === 'Enter' && handleLatestNews()}
                />
              </div>
              <button className="btn-secondary" style={{ padding: '8px 20px', height: '40px' }} onClick={handleLatestNews} disabled={loading === 'latest'}>
                {loading === 'latest' ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
                Fetch Live News
              </button>
            </div>

            {/* Advanced Filters toggles */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="caption">Tone:</span>
                <select className="text-input" style={{ padding: '4px 12px', height: '32px', width: '130px', fontSize: '14px' }} value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                  <option value="All">All Tones</option>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="caption">Publisher:</span>
                <select className="text-input" style={{ padding: '4px 12px', height: '32px', width: '150px', fontSize: '14px' }} value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                  <option value="All">All Publishers</option>
                  <option value="Reuters">Reuters</option>
                  <option value="Financial">Financial Times</option>
                  <option value="Science">Space Science</option>
                  <option value="Environment">World Environment</option>
                </select>
              </div>
            </div>

            {/* Live news query list output */}
            {latestNews.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <span className="eyebrow-uppercase" style={{ color: 'var(--ink)' }}>Live Ingested Feed ({latestNews.length} articles)</span>
                <div className="discover-grid" style={{ marginTop: '16px' }}>
                  {latestNews.map((item, index) => (
                    <div className="card-white news-card" key={`live-${index}`}>
                      <div className="news-card-meta">
                        <span className="caption" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>LIVE · {item.source?.name || 'Publisher'}</span>
                        <span className="badge-pill">Live Feed</span>
                      </div>
                      <h3 className="news-card-title display-xs">{item.title}</h3>
                      <p className="news-card-summary">{item.description || 'No summary details provided. Import this briefing to extract full NLP summaries and metadata models.'}</p>
                      <div className="news-card-footer">
                        <span className="caption">{Math.ceil((item.content?.length || 500) / 900)} min read</span>
                        <button className="news-card-action" onClick={() => handleLoadAndAnalyze({
                          ...item,
                          text: [item.title, item.description, item.content].filter(Boolean).join('\n\n'),
                        })}>
                          Analyze <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button className="btn-tertiary" onClick={() => setLatestNews([])}>Clear Live Feed</button>
                </div>
                <hr style={{ margin: '32px 0', borderColor: 'var(--border)' }} />
              </div>
            )}

            {/* Core Discover News Grid */}
            <div className="discover-grid">
              {filteredDiscoverNews.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0' }}>
                  <h3 className="display-xs">No matching news briefings found</h3>
                  <p className="caption">Try clearing your filters or testing another category</p>
                </div>
              ) : (
                filteredDiscoverNews.map((item) => (
                  <div className="card-white news-card" key={item.id}>
                    <div className="news-card-meta">
                      <span className="caption" style={{ textTransform: 'uppercase', fontWeight: '600' }}>{item.category} · {item.source}</span>
                      <span className="caption">{item.time}</span>
                    </div>
                    <h3 className="news-card-title display-xs" style={{ fontSize: '18px', fontWeight: '600' }}>{item.title}</h3>
                    <p className="news-card-summary">{item.summary}</p>
                    
                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {item.tags.map(t => (
                        <span key={t} className="badge-pill" style={{ fontSize: '11px', padding: '2px 8px' }} onClick={(e) => {
                          e.stopPropagation();
                          setGlobalSearchQuery(t);
                        }}>
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="news-card-footer">
                      {/* Sentiment Pill */}
                      <span className={`badge-pill`} style={{ 
                        backgroundColor: item.sentiment.label === 'Positive' ? 'var(--positive-bg)' : item.sentiment.label === 'Negative' ? 'var(--negative-bg)' : 'var(--neutral-bg)',
                        color: item.sentiment.label === 'Positive' ? 'var(--positive)' : item.sentiment.label === 'Negative' ? 'var(--negative)' : 'var(--neutral)'
                      }}>
                        {item.sentiment.label} · {item.sentiment.confidence}%
                      </span>
                      
                      <button className="news-card-action" onClick={() => handleLoadAndAnalyze(item)}>
                        Analyze <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* How It Works Section */}
            <div style={{ marginTop: '96px', borderTop: '1px solid var(--border)', paddingTop: '64px' }}>
              <div className="editorial-header">
                <span className="eyebrow-uppercase">Core Pipeline</span>
                <h2 className="display-md">How the understanding engine works</h2>
                <p className="body-sm">Our dual NLP and LLM layers process text input asynchronously to structure editorial outputs.</p>
              </div>

              {/* Progress Flow Blocks */}
              <div className="pipeline-grid">
                {[
                  { num: '01', title: 'Collect', desc: 'Fetch web articles, text uploads, or copy-pasted blocks.' },
                  { num: '02', title: 'Understand', desc: 'Identify syntax, named entities, key phrases, and statistics.' },
                  { num: '03', title: 'Summarize', desc: 'Generate multi-tier summaries from 100-word TL;DRs to detailed outlines.' },
                  { num: '04', title: 'Analyze', desc: 'Evaluate tone patterns, emotional polarities, and contextual bias.' },
                  { num: '05', title: 'Discover', desc: 'Save workspace intelligence, explore correlations, and index trends.' }
                ].map((step, idx) => (
                  <div className="card-content" key={step.num} style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>{step.num}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: 'var(--ink)' }}>{step.title}</h4>
                    <p className="caption" style={{ fontSize: '13px' }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="feature-highlights-grid">
              <div className="card-content" style={{ borderLeft: '3px solid var(--primary)' }}>
                <h3 className="display-xs" style={{ fontSize: '18px', marginBottom: '8px' }}>AI Summarization</h3>
                <p className="caption" style={{ fontSize: '14px', lineHeight: '1.5' }}>Switch instantly between Brief, Standard, or Detailed summaries. Generate LexRank/TextRank sentences to extract structural arguments without biases.</p>
              </div>
              <div className="card-content" style={{ borderLeft: '3px solid var(--positive)' }}>
                <h3 className="display-xs" style={{ fontSize: '18px', marginBottom: '8px' }}>Sentiment Intelligence</h3>
                <p className="caption" style={{ fontSize: '14px', lineHeight: '1.5' }}>Examine sentence-level metrics mapping positive, neutral, and negative tones. Receive an AI rationale explaining the contextual tone classification.</p>
              </div>
              <div className="card-content" style={{ borderLeft: '3px solid var(--ink)' }}>
                <h3 className="display-xs" style={{ fontSize: '18px', marginBottom: '8px' }}>NLP Named Signals</h3>
                <p className="caption" style={{ fontSize: '14px', lineHeight: '1.5' }}>Extract people, organizations, and spatial locations in real time. Uncover hidden entities and drill down into cross-referenced publications instantly.</p>
              </div>
            </div>

            {/* Dark strategically placed coffee block */}
            <div className="dark-insights-band" style={{ marginTop: '80px' }}>
              <div className="dark-insights-title">
                <span className="eyebrow-uppercase" style={{ color: 'var(--primary)' }}>Featured Intelligence</span>
                <h2 className="display-md">Deep dive into global developments</h2>
                <p className="body-sm" style={{ color: 'var(--mute)' }}>Gain holistic context over major topics moving global markets and technologies today.</p>
              </div>
              <div className="dark-insights-grid">
                <div className="dark-insight-card">
                  <span className="caption" style={{ color: 'var(--primary)' }}>TRENDING</span>
                  <h3>AI Regulatory Waves</h3>
                  <p>As the European Union begins enforcement of the AI Act, corporate compliance systems are shifting heavily to verify supply chain code transparency models.</p>
                </div>
                <div className="dark-insight-card">
                  <span className="caption" style={{ color: 'var(--primary)' }}>INSIGHT</span>
                  <h3>Hydrological Markers on Mars</h3>
                  <p>Water marks in Utopia Planitia support the thesis that Mars hosted habitable aquatic conditions longer than previously modeled by astro-biologists.</p>
                </div>
                <div className="dark-insight-card">
                  <span className="caption" style={{ color: 'var(--primary)' }}>ECONOMICS</span>
                  <h3>Disinflation Velocities</h3>
                  <p>Central banks globally are mapping employment trends over commodity pricing indices, signalling a structured transition to moderate rate regimes.</p>
                </div>
                <div className="dark-insight-card">
                  <span className="caption" style={{ color: 'var(--primary)' }}>EVALUATION</span>
                  <h3>Extreme Weather Defense</h3>
                  <p>Regional pilot networks are utilizing AI machine learning models to forecast heavy downpours, aiming to insulate municipal grids against economic shock.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer style={{ marginTop: '96px', borderTop: '1px solid var(--border)', padding: '48px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              <div>
                <p className="body-md-strong" style={{ color: 'var(--ink)' }}>News Intelligence Studio</p>
                <p className="caption">Warm, Editorial AI Understanding Platform.</p>
              </div>
              <div style={{ display: 'flex', gap: '48px' }}>
                <div>
                  <p className="caption" style={{ fontWeight: '600', color: 'var(--ink)' }}>Navigation</p>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><a href="#" onClick={() => setCurrentTab('discover')}>Discover</a></li>
                    <li><a href="#" onClick={() => setCurrentTab('intelligence')}>Analyze</a></li>
                    <li><a href="#" onClick={() => setCurrentTab('trending')}>Trending</a></li>
                    <li><a href="#" onClick={() => setCurrentTab('analytics')}>Analytics</a></li>
                  </ul>
                </div>
                <div>
                  <p className="caption" style={{ fontWeight: '600', color: 'var(--ink)' }}>Resources</p>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Project</a></li>
                    <li><a href="#">API Documentation</a></li>
                    <li><a href="#">NLP Models Summary</a></li>
                  </ul>
                </div>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--body-mid)' }}>
                <span>&copy; 2026 News Intelligence Studio. All rights reserved.</span>
                <span>Powered by FastAPI & Transformer Pipelines.</span>
              </div>
            </footer>
          </div>
        )}

        {currentTab === 'intelligence' && (
          <div className="container">
            {/* If no result is loaded, show the workspace input/form dashboard */}
            {!result ? (
              <div className="analyzer-box">
                <div className="editorial-header">
                  <span className="eyebrow-uppercase">Workspace</span>
                  <h1 className="display-md">Turn Any Article Into News Intelligence</h1>
                  <p className="body-md">Ingest news articles, parse transcripts, or fetch remote URLs to generate multi-tier summaries, named entity signals, and sentiment scores.</p>
                </div>

                {/* Simulated Loading/Thinking checklist screen */}
                {simulatedProcessing ? (
                  <div className="card-content" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Loader2 className="spin" size={24} style={{ color: 'var(--primary)' }} />
                      <h3 className="display-xs" style={{ fontSize: '20px' }}>Extracting news signals...</h3>
                    </div>
                    
                    {/* Orange micro progress bar */}
                    <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: 'var(--primary)', 
                        width: `${((activeStepIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
                        transition: 'width 0.2s ease'
                      }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      {PROCESSING_STEPS.map((stepText, idx) => {
                        const isDone = idx < activeStepIndex;
                        const isActive = idx === activeStepIndex;
                        return (
                          <div key={idx} className={`sim-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`} style={{ opacity: idx <= activeStepIndex + 1 ? 1 : 0.4 }}>
                            <div className="sim-indicator">
                              {isDone ? <Check size={12} /> : idx + 1}
                            </div>
                            <span>{stepText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Standard Input Forms */
                  <div className="card-white" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Tabs for Input formats */}
                    <div className="analyzer-tabs">
                      <button 
                        className={`analyzer-tab-btn ${analyzerInputMode === 'text' ? 'active' : ''}`}
                        onClick={() => setAnalyzerInputMode('text')}
                      >
                        Copy-Paste Text
                      </button>
                      <button 
                        className={`analyzer-tab-btn ${analyzerInputMode === 'url' ? 'active' : ''}`}
                        onClick={() => setAnalyzerInputMode('url')}
                      >
                        Fetch URL
                      </button>
                      <button 
                        className={`analyzer-tab-btn ${analyzerInputMode === 'file' ? 'active' : ''}`}
                        onClick={() => setAnalyzerInputMode('file')}
                      >
                        File Upload
                      </button>
                    </div>

                    {/* Render corresponding form */}
                    {analyzerInputMode === 'text' && (
                      <div className="analyzer-body">
                        <div>
                          <label className="caption" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Article Title</label>
                          <input 
                            className="text-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter news headline..."
                          />
                        </div>
                        <div>
                          <label className="caption" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Article Content (at least 20 words)</label>
                          <textarea 
                            className="text-input"
                            style={{ minHeight: '260px', lineHeight: '1.6' }}
                            value={articleText}
                            onChange={(e) => setArticleText(e.target.value)}
                            placeholder="Paste full text of the news story here..."
                          />
                        </div>
                      </div>
                    )}

                    {analyzerInputMode === 'url' && (
                      <div className="analyzer-body">
                        <label className="caption" style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>Article URL</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input 
                            className="text-input"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/news/article-slug"
                            onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                          />
                          <button className="btn-secondary" onClick={handleFetchUrl} disabled={loading === 'url'}>
                            {loading === 'url' ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
                            Fetch URL
                          </button>
                        </div>
                        <p className="caption">Automatically pulls headline and body text, ignoring advertising trackers.</p>
                      </div>
                    )}

                    {analyzerInputMode === 'file' && (
                      <div className="analyzer-body">
                        <label className="caption" style={{ fontWeight: '600', display: 'block' }}>Upload Document</label>
                        <label className="file-drop-zone">
                          <div className="file-drop-zone-icon">
                            {loading === 'upload' ? <Loader2 className="spin" size={24} /> : <Upload size={24} />}
                          </div>
                          <div>
                            <p className="body-sm-strong" style={{ color: 'var(--ink)' }}>Drag & drop or click to choose file</p>
                            <p className="caption">Supports PDF, DOCX, or plain TXT files up to 10MB</p>
                          </div>
                          <input type="file" accept=".txt,.pdf,.docx" style={{ display: 'none' }} onChange={handleUpload} />
                        </label>
                      </div>
                    )}

                    {/* Transformer Option & Ingest CTA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                          checked={useAbstractive}
                          onChange={(e) => setUseAbstractive(e.target.checked)}
                        />
                        <span className="caption" style={{ fontWeight: '500' }}>Request neural transformer summary (requires server GPU)</span>
                      </label>

                      <button 
                        className="btn-primary" 
                        disabled={!canAnalyze || loading === 'analyze'}
                        onClick={handleAnalyze}
                      >
                        {loading === 'analyze' ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                        Analyze with AI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If result is loaded, show the complete article intelligence workspace */
              <div className="workspace-grid">
                {/* Left Column: Original Source content */}
                <div className="article-panel">
                  {/* Article main info */}
                  <div className="article-body-box">
                    <span className="eyebrow-uppercase">{result.category || 'General Briefing'}</span>
                    
                    <input 
                      className="article-title-field" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Article Title"
                    />

                    {/* Metadata Strip */}
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--body-mid)', fontSize: '13px', marginBottom: '24px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <span>Words: <strong>{result.statistics?.word_count || articleText.split(/\s+/).length}</strong></span>
                      <span>Category: <strong>{result.category || 'General'}</strong></span>
                      <span>Read Time: <strong>{result.reading_time?.original || '2 min'}</strong></span>
                      <span>Entities: <strong>{entityCount} signals</strong></span>
                    </div>

                    <textarea 
                      className="article-text-area"
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder="Paste article text here..."
                    />
                  </div>

                  {/* Strategic Dark coffee insights section */}
                  <div className="card-dark" style={{ backgroundColor: '#201515', color: '#fffefb' }}>
                    <h3 className="display-xs" style={{ color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} /> What the AI noticed
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <span className="eyebrow-uppercase" style={{ color: 'var(--mute)', fontSize: '11px' }}>Core Takeaway</span>
                        <p className="caption" style={{ color: '#ebdcd0', fontSize: '14px', lineHeight: '1.5', marginTop: '4px' }}>
                          {result.summaries.short || 'Evaluating core claims inside the text blocks.'}
                        </p>
                      </div>
                      <div>
                        <span className="eyebrow-uppercase" style={{ color: 'var(--mute)', fontSize: '11px' }}>Contextual Impact</span>
                        <p className="caption" style={{ color: '#ebdcd0', fontSize: '14px', lineHeight: '1.5', marginTop: '4px' }}>
                          The document indicates a high degree of correlation between technical advancements and policy guidelines, implying structured adaptations across industry verticals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ask Question block */}
                  <div className="card-white qa-chat-box">
                    <div>
                      <span className="eyebrow-uppercase">Ask the Article</span>
                      <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600' }}>Contextual Q&A</h3>
                      <p className="caption">Query the article text for immediate answers based on backend NLP extraction pipelines.</p>
                    </div>

                    {qaHistory.length > 0 && (
                      <div className="qa-chat-history">
                        {qaHistory.map((chat, idx) => (
                          <div key={idx} className={`qa-bubble ${chat.sender}`}>
                            <p>{chat.text}</p>
                            {chat.confidence && (
                              <span style={{ fontSize: '10px', display: 'block', marginTop: '4px', opacity: 0.8, fontWeight: 'bold' }}>
                                Confidence: {chat.confidence}%
                              </span>
                            )}
                            {chat.evidence && chat.evidence.length > 0 && (
                              <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '8px', marginTop: '6px', fontSize: '12px', color: 'var(--body-mid)' }}>
                                <em>Evidence:</em> {chat.evidence.join('... ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="qa-input-row">
                      <input 
                        className="text-input" 
                        value={question} 
                        onChange={(e) => setQuestion(e.target.value)} 
                        placeholder="Ask the article, e.g. What organizations are involved?"
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                      />
                      <button className="btn-primary" style={{ padding: '8px 20px' }} onClick={handleAsk} disabled={loading === 'ask'}>
                        {loading === 'ask' ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
                        Query
                      </button>
                    </div>
                  </div>

                  {/* Comparative Matrix Section */}
                  <div className="card-white comparison-container">
                    <div>
                      <span className="eyebrow-uppercase">Article Cross-Reference</span>
                      <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600' }}>Compare Stories</h3>
                      <p className="caption">Select another parsed article to compare summaries, sentiments, and primary topics.</p>
                    </div>

                    {/* Selector */}
                    <div className="compare-selector">
                      <span className="caption">Compare with:</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {history.filter(h => h.title !== (title || result.title)).map(h => {
                          const isSelected = compareArticleIds.includes(h.result?.id || h.id);
                          return (
                            <button 
                              key={h.id}
                              className={`category-pill ${isSelected ? 'active' : ''}`}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => {
                                const id = h.result?.id || h.id;
                                if (compareArticleIds.includes(id)) {
                                  setCompareArticleIds(prev => prev.filter(x => x !== id));
                                } else {
                                  // Max 2 comparisons (total 3 stories)
                                  if (compareArticleIds.length >= 2) {
                                    triggerToast('Can compare maximum of 3 articles');
                                    return;
                                  }
                                  setCompareArticleIds(prev => [...prev, id]);
                                }
                              }}
                            >
                              {h.title.substring(0, 32)}...
                            </button>
                          );
                        })}
                        {history.filter(h => h.title !== (title || result.title)).length === 0 && (
                          <span className="caption" style={{ color: 'var(--mute)' }}>Analyze more articles to enable side-by-side comparison</span>
                        )}
                      </div>
                    </div>

                    {/* Comparative Table Matrix */}
                    {compareArticleIds.length > 0 && (
                      <div style={{ overflowX: 'auto' }}>
                        <table className="compare-matrix-table">
                          <thead>
                            <tr>
                              <th>Feature</th>
                              <th style={{ width: '35%' }}>{title || result.title} (Active)</th>
                              {comparisonResults.map((c, i) => (
                                <th key={i} style={{ width: '35%' }}>{c.title}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Summary</td>
                              <td>{result.summaries.short}</td>
                              {comparisonResults.map((c, i) => (
                                <td key={i}>{c.summaries.short}</td>
                              ))}
                            </tr>
                            <tr>
                              <td>Sentiment</td>
                              <td>
                                <span className={`badge-pill`} style={{ 
                                  backgroundColor: result.sentiment.label === 'Positive' ? 'var(--positive-bg)' : result.sentiment.label === 'Negative' ? 'var(--negative-bg)' : 'var(--neutral-bg)',
                                  color: result.sentiment.label === 'Positive' ? 'var(--positive)' : result.sentiment.label === 'Negative' ? 'var(--negative)' : 'var(--neutral)'
                                }}>
                                  {result.sentiment.label} ({result.sentiment.confidence}%)
                                </span>
                              </td>
                              {comparisonResults.map((c, i) => (
                                <td key={i}>
                                  <span className={`badge-pill`} style={{ 
                                    backgroundColor: c.sentiment.label === 'Positive' ? 'var(--positive-bg)' : c.sentiment.label === 'Negative' ? 'var(--negative-bg)' : 'var(--neutral-bg)',
                                    color: c.sentiment.label === 'Positive' ? 'var(--positive)' : c.sentiment.label === 'Negative' ? 'var(--negative)' : 'var(--neutral)'
                                  }}>
                                    {c.sentiment.label} ({c.sentiment.confidence}%)
                                  </span>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td>Primary Category</td>
                              <td><strong>{result.category}</strong></td>
                              {comparisonResults.map((c, i) => (
                                <td key={i}><strong>{c.category}</strong></td>
                              ))}
                            </tr>
                            <tr>
                              <td>Entities</td>
                              <td>{Object.values(result.entities).flat().slice(0, 6).join(', ')}</td>
                              {comparisonResults.map((c, i) => (
                                <td key={i}>{Object.values(c.entities).flat().slice(0, 6).join(', ')}</td>
                              ))}
                            </tr>
                            <tr>
                              <td>Facticity Estimate</td>
                              <td>{result.fake_news_probability?.label || 'Low Risk'}</td>
                              {comparisonResults.map((c, i) => (
                                <td key={i}>{c.fake_news_probability?.label || 'Low Risk'}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: AI Extraction & Details */}
                <div className="intelligence-panel">
                  
                  {/* Action Bar */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-tertiary" style={{ flexGrow: 1 }} onClick={() => setResult(null)}>
                      <RefreshCw size={14} /> New Analysis
                    </button>
                    <button className="btn-primary" style={{ flexGrow: 1 }} onClick={handleAnalyze} disabled={loading === 'analyze'}>
                      {loading === 'analyze' ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />} Re-Process
                    </button>
                  </div>

                  {/* Summary Block */}
                  <div className="card-white">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600' }}>AI Summary</h3>
                      <div className="summary-toolbar-actions">
                        <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={speakSummary} title="Read summary aloud">
                          <Volume2 size={14} />
                        </button>
                        <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={exportPdf} title="Export briefing PDF">
                          <Download size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="summary-nav-tabs">
                      {['short', 'medium', 'detailed', 'extractive_textrank', 'extractive_lexrank', ...(result.summaries.abstractive ? ['abstractive'] : [])].map((tab) => (
                        <button
                          key={tab}
                          className={`summary-nav-tab ${summaryTab === tab ? 'active' : ''}`}
                          onClick={() => setSummaryTab(tab)}
                        >
                          {tab.replace('extractive_', '').replace('_', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="summary-text-container">
                      <p>{result.summaries[summaryTab] || 'No summary version generated.'}</p>
                    </div>
                  </div>

                  {/* Sentiment Block */}
                  <div className="card-white">
                    <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Sentiment Bias</h3>
                    
                    <div className="sentiment-display">
                      <span className={`sentiment-heading ${result.sentiment.label.toLowerCase()}`}>
                        {result.sentiment.label}
                      </span>
                      <span className="caption" style={{ fontWeight: '600' }}>
                        {result.sentiment.confidence}% Confidence
                      </span>
                    </div>

                    {/* Progress bars */}
                    <div className="sentiment-bar-chart">
                      {Object.entries(result.sentiment.scores).map(([lbl, val]) => (
                        <div className="sentiment-bar-row" key={lbl}>
                          <span style={{ textTransform: 'capitalize' }}>{lbl}</span>
                          <div className="sentiment-bar-track">
                            <div 
                              className={`sentiment-bar-fill ${lbl.toLowerCase()}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span style={{ fontWeight: '600', textAlign: 'right' }}>{val}%</span>
                        </div>
                      ))}
                    </div>

                    <div className="sentiment-explanation">
                      <p><strong>Rationale:</strong> The article presents a primarily {result.sentiment.label.toLowerCase()}-leaning framework with focused vocabulary supporting strategic alignment.</p>
                    </div>
                  </div>

                  {/* NLP Named signals */}
                  <div className="card-white">
                    <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>NLP Named Signals</h3>
                    
                    <div className="entity-block-grid">
                      {Object.entries(result.entities).map(([label, items]) => {
                        if (items.length === 0) return null;
                        return (
                          <div className="entity-section" key={label}>
                            <span className="entity-header">{label}</span>
                            <div className="entity-pills-list">
                              {items.map((item) => (
                                <button 
                                  key={item} 
                                  className="entity-pill"
                                  onClick={() => {
                                    setGlobalSearchQuery(item);
                                    setCurrentTab('discover');
                                    triggerToast(`Filtering Discover feed for: ${item}`);
                                  }}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Object.entries(result.entities).every(([_, list]) => list.length === 0) && (
                        <p className="caption">No entities detected in current document chunk.</p>
                      )}
                    </div>
                  </div>

                  {/* Technical statistics */}
                  <div className="card-white">
                    <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Reading Metrics</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption">Sentences</span>
                        <strong style={{ color: 'var(--ink)' }}>{result.statistics?.sentence_count || 10}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption">Compression ratio</span>
                        <strong style={{ color: 'var(--ink)' }}>{result.statistics?.compression_ratio || 40}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="caption">Summary words</span>
                        <strong style={{ color: 'var(--ink)' }}>{result.statistics?.summary_word_count || 65}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                        <span className="caption">Facticity Risk</span>
                        <strong style={{ 
                          color: (result.fake_news_probability?.probability || 10) > 40 ? 'var(--negative)' : 'var(--positive)'
                        }}>
                          {result.fake_news_probability?.label || 'Low Risk'} ({result.fake_news_probability?.probability || 5}%)
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Word cloud */}
                  {result.word_cloud && result.word_cloud.length > 0 && (
                    <div className="card-white">
                      <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Term Density</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', justifyContent: 'center', padding: '10px 0' }}>
                        {result.word_cloud.slice(0, 16).map((word, index) => {
                          const size = 12 + Math.min(word.value * 2.5, 14);
                          return (
                            <span 
                              key={word.text} 
                              style={{ 
                                fontSize: `${size}px`, 
                                fontWeight: word.value > 3 ? '600' : '400',
                                color: index % 3 === 0 ? 'var(--primary)' : index % 3 === 1 ? 'var(--ink)' : 'var(--body)'
                              }}
                            >
                              {word.text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'trending' && (
          <div className="container">
            <div className="editorial-header">
              <span className="eyebrow-uppercase">Trends Radar</span>
              <h1 className="display-md">Trending Intelligence Topics</h1>
              <p className="body-md">Real-time analysis of keywords, organizations, and news topics showing high volume fluctuations.</p>
            </div>

            {/* List of trending topics cards */}
            <div className="trending-topics-grid">
              {[
                { topic: 'Artificial Intelligence', volume: '+42%', polarity: 'Neutral', bg: 'var(--canvas-soft)', border: 'var(--border)' },
                { topic: 'Global Markets', volume: '+28%', polarity: 'Positive', bg: 'var(--canvas-soft)', border: 'var(--border)' },
                { topic: 'Climate Treaties', volume: '+19%', polarity: 'Positive', bg: 'var(--canvas-soft)', border: 'var(--border)' },
                { topic: 'Semiconductors Ohio', volume: '+12%', polarity: 'Neutral', bg: 'var(--canvas-soft)', border: 'var(--border)' }
              ].map((t, i) => (
                <div className="card-white" key={i} style={{ borderLeft: '3px solid var(--primary)' }}>
                  <span className="caption" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{t.volume} Volume</span>
                  <h3 className="display-xs" style={{ fontSize: '18px', marginTop: '4px' }}>{t.topic}</h3>
                  <div className="trending-topic-footer">
                    <span className="caption">Polarity: <strong>{t.polarity}</strong></span>
                    <button className="btn-icon" style={{ width: '28px', height: '28px', borderRadius: '4px' }} onClick={() => {
                      setGlobalSearchQuery(t.topic);
                      setCurrentTab('discover');
                    }}>
                      <Search size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sentiment Around Trending Topics table */}
            <div className="card-white">
              <span className="eyebrow-uppercase">Consolidated Indicators</span>
              <h3 className="display-xs" style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Sentiment Around Trending Topics</h3>
              
              <div className="table-scroll-wrapper">
                <table className="compare-matrix-table">
                  <thead>
                  <tr>
                    <th>Topic Group</th>
                    <th>Volume Change</th>
                    <th>Positive %</th>
                    <th>Neutral %</th>
                    <th>Negative %</th>
                    <th>Trend Direction</th>
                  </tr>
                  </thead>
                  <tbody>
                  {[
                    { name: 'Generative Models & NLP', change: '+42%', pos: 60, neu: 35, neg: 5, dir: 'UP' },
                    { name: 'US Monetary Interest Rates', change: '+28%', pos: 88, neu: 10, neg: 2, dir: 'UP' },
                    { name: 'United Nations Oceans Moratorium', change: '+19%', pos: 81, neu: 15, neg: 4, dir: 'UP' },
                    { name: 'Advanced Silicon Fabrication', change: '+12%', pos: 10, neu: 85, neg: 5, dir: 'STEADY' }
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.change}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--positive)', fontWeight: 'bold' }}>{row.pos}%</span>
                          <div style={{ width: '40px', height: '6px', borderRadius: '2px', backgroundColor: 'var(--border)' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--positive)', width: `${row.pos}%`, borderRadius: 'inherit' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--neutral)', fontWeight: 'bold' }}>{row.neu}%</span>
                          <div style={{ width: '40px', height: '6px', borderRadius: '2px', backgroundColor: 'var(--border)' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--neutral)', width: `${row.neu}%`, borderRadius: 'inherit' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--negative)', fontWeight: 'bold' }}>{row.neg}%</span>
                          <div style={{ width: '40px', height: '6px', borderRadius: '2px', backgroundColor: 'var(--border)' }}>
                            <div style={{ height: '100%', backgroundColor: 'var(--negative)', width: `${row.neg}%`, borderRadius: 'inherit' }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-pill" style={{ 
                          backgroundColor: row.dir === 'UP' ? 'var(--positive-bg)' : 'var(--neutral-bg)',
                          color: row.dir === 'UP' ? 'var(--positive)' : 'var(--neutral)'
                        }}>
                          {row.dir}
                        </span>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'analytics' && (
          <div className="container">
            <div className="editorial-header">
              <span className="eyebrow-uppercase">Platform Metrics</span>
              <h1 className="display-md">News Intelligence Analytics</h1>
              <p className="body-md">Consolidated workspace metadata mapping document volumes, classifications, and system performance.</p>
            </div>

            {/* KPI metrics strip */}
            <div className="stats-strip">
              {[
                { title: 'Articles Analyzed', val: analyticsKPIs.totalAnalyzed },
                { title: 'Avg Confidence', val: `${analyticsKPIs.avgConfidence}%` },
                { title: 'Positive Bias', val: analyticsKPIs.positiveCount },
                { title: 'Neutral Bias', val: analyticsKPIs.neutralCount },
                { title: 'Negative Bias', val: analyticsKPIs.negativeCount },
                { title: 'Facticity Rating', val: '92%' }
              ].map((kpi, idx) => (
                <div className="card-white stat-kpi-card" key={idx}>
                  <span className="caption" style={{ fontSize: '12px' }}>{kpi.title}</span>
                  <span className="stat-kpi-val">{kpi.val}</span>
                </div>
              ))}
            </div>

            {/* Visual SVG charts */}
            <div className="charts-row-grid">
              {/* Chart 1: Sentiment Distribution (Bar Chart SVG) */}
              <div className="card-white">
                <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Ingestion Sentiment Ratios</h3>
                <div className="chart-svg-container">
                  {/* Axis lines */}
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '1px', backgroundColor: 'var(--border)' }} />
                  
                  {/* Positive bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--positive)' }}>{analyticsKPIs.positiveCount} articles</span>
                    <div style={{ 
                      width: '40px', 
                      height: `${Math.max((analyticsKPIs.positiveCount / Math.max(analyticsKPIs.totalAnalyzed, 1)) * 140, 15)}px`,
                      backgroundColor: 'var(--positive)',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span className="caption">Positive</span>
                  </div>

                  {/* Neutral bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--neutral)' }}>{analyticsKPIs.neutralCount} articles</span>
                    <div style={{ 
                      width: '40px', 
                      height: `${Math.max((analyticsKPIs.neutralCount / Math.max(analyticsKPIs.totalAnalyzed, 1)) * 140, 15)}px`,
                      backgroundColor: 'var(--neutral)',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span className="caption">Neutral</span>
                  </div>

                  {/* Negative bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--negative)' }}>{analyticsKPIs.negativeCount} articles</span>
                    <div style={{ 
                      width: '40px', 
                      height: `${Math.max((analyticsKPIs.negativeCount / Math.max(analyticsKPIs.totalAnalyzed, 1)) * 140, 15)}px`,
                      backgroundColor: 'var(--negative)',
                      borderRadius: '4px 4px 0 0'
                    }} />
                    <span className="caption">Negative</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Category distribution (SVG Donut layout simulated elegantly) */}
              <div className="card-white">
                <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Category Frequency Distribution</h3>
                <div className="category-chart-content">
                  {/* Circular SVG Donut */}
                  <svg width="140" height="140" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--border)" strokeWidth="3" />
                    
                    {/* Segment 1: Tech (40%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--primary)" strokeWidth="3" 
                            strokeDasharray="40 60" strokeDashoffset="0" />
                    
                    {/* Segment 2: Business (30%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--positive)" strokeWidth="3" 
                            strokeDasharray="30 70" strokeDashoffset="-40" />

                    {/* Segment 3: Science (20%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--neutral)" strokeWidth="3" 
                            strokeDasharray="20 80" strokeDashoffset="-70" />

                    {/* Segment 4: Other (10%) */}
                    <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="var(--mute)" strokeWidth="3" 
                            strokeDasharray="10 90" strokeDashoffset="-90" />
                  </svg>

                  {/* Legends */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--primary)' }} />
                      <span className="caption" style={{ color: 'var(--ink)' }}>Technology (40%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--positive)' }} />
                      <span className="caption" style={{ color: 'var(--ink)' }}>Business (30%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--neutral)' }} />
                      <span className="caption" style={{ color: 'var(--ink)' }}>Science (20%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--mute)' }} />
                      <span className="caption" style={{ color: 'var(--ink)' }}>World/Other (10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'saved' && (
          <div className="container">
            <div className="editorial-header">
              <span className="eyebrow-uppercase">Library</span>
              <h1 className="display-md">Saved Workspace Intelligence</h1>
              <p className="body-md">Review historical extractions, summaries, and model records cached locally in your browser workspace.</p>
            </div>

            {/* Saved list controls */}
            <div className="saved-list-controls">
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--body-mid)' }} />
                <input 
                  className="text-input" 
                  style={{ paddingLeft: '36px' }}
                  placeholder="Search saved articles by title, tags..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                />
              </div>

              {/* Reset library button */}
              <button className="btn-tertiary" onClick={() => {
                if (window.confirm('Delete all saved articles in local history?')) {
                  setHistory([]);
                  setResult(null);
                  triggerToast('Workspace history cleared');
                }
              }}>
                <Trash2 size={16} /> Clear All
              </button>
            </div>

            {/* Saved items list */}
            {history.length === 0 ? (
              <div className="card-content" style={{ padding: '64px 0', textAlign: 'center' }}>
                <h3 className="display-xs">Your library is currently empty</h3>
                <p className="caption" style={{ marginBottom: '16px' }}>Save news briefings or run AI analysis to populate your workspaces.</p>
                <button className="btn-primary" onClick={() => setCurrentTab('discover')}>Discover News</button>
              </div>
            ) : (
              <div className="saved-items-grid">
                {history.map((item) => (
                  <div className="card-white saved-item-card" key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="caption" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{item.category}</span>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className={`badge-pill`} style={{ 
                          backgroundColor: item.sentiment === 'Positive' ? 'var(--positive-bg)' : item.sentiment === 'Negative' ? 'var(--negative-bg)' : 'var(--neutral-bg)',
                          color: item.sentiment === 'Positive' ? 'var(--positive)' : item.sentiment === 'Negative' ? 'var(--negative)' : 'var(--neutral)'
                        }}>
                          {item.sentiment}
                        </span>
                        
                        {/* Delete history button */}
                        <button className="btn-icon" style={{ width: '28px', height: '28px', padding: 0 }} onClick={(e) => deleteHistoryItem(item.id, e)} title="Remove from saved history">
                          <Trash2 size={12} style={{ color: 'var(--negative)' }} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="display-xs" style={{ fontSize: '18px', fontWeight: '600' }}>{item.title}</h3>
                    
                    <p className="caption" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.text}
                    </p>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="caption" style={{ fontSize: '12px' }}>Saved: {new Date(item.id).toLocaleDateString()}</span>
                      
                      <button className="btn-tertiary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => {
                        const targetResult = item.result || SAMPLE_DISCOVER_ARTICLES.find(a => a.title === item.title);
                        if (targetResult && targetResult.summaries) {
                          setTitle(item.title);
                          setArticleText(item.text);
                          setResult(targetResult);
                          setCurrentTab('intelligence');
                          triggerToast('Loaded intelligence workspace');
                        } else {
                          handleLoadAndAnalyze(item);
                        }
                      }}>
                        Load Workspace <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-msg-container">
          <Check size={16} style={{ color: 'var(--primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--primary, #ff4f00)', marginBottom: '12px' }}>Something went wrong while rendering</h2>
          <p style={{ color: 'var(--body, #666)', marginBottom: '24px' }}>An unexpected UI error occurred. Click below to reload the workspace.</p>
          <button 
            style={{ padding: '10px 20px', backgroundColor: 'var(--primary, #ff4f00)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reset Workspace
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
