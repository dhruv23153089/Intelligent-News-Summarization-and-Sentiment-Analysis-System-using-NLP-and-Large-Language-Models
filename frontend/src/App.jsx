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
} from 'lucide-react';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  analyzeArticle,
  askQuestion,
  fetchLatestNews,
  fetchUrl,
  uploadArticle,
} from './api';

const sampleArticle = `Artificial intelligence researchers and climate policy leaders met in New Delhi on 14 July 2026 to discuss how advanced forecasting systems can help governments respond to extreme weather. Officials said the initiative will combine satellite data, local reports, and machine learning models to predict floods and heat waves with greater accuracy. The Ministry of Earth Sciences said the system will first be tested in coastal regions before expanding to other parts of India. Several technology companies and universities, including public research labs, will contribute tools for data analysis and public alerts. Experts said the project could reduce economic losses and protect vulnerable communities if warnings reach citizens quickly. Some civil society groups urged the government to publish model limitations and protect personal data collected during emergency response. The pilot program is expected to begin later this year, with an independent review planned after six months.`;

function App() {
  const [articleText, setArticleText] = useState(sampleArticle);
  const [title, setTitle] = useState('AI climate forecasting pilot announced in India');
  const [url, setUrl] = useState('');
  const [newsQuery, setNewsQuery] = useState('technology');
  const [question, setQuestion] = useState('What is the conclusion?');
  const [answer, setAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history') || '[]'));
  const [summaryTab, setSummaryTab] = useState('medium');
  const [useAbstractive, setUseAbstractive] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history.slice(0, 8)));
  }, [history]);

  const canAnalyze = articleText.trim().split(/\s+/).length > 20;

  const entityCount = useMemo(() => {
    if (!result?.entities) return 0;
    return Object.values(result.entities).reduce((sum, items) => sum + items.length, 0);
  }, [result]);

  async function handleAnalyze() {
    if (!canAnalyze) {
      setError('Paste a longer article before analyzing.');
      return;
    }
    setLoading('analyze');
    setError('');
    setAnswer(null);
    try {
      const data = await analyzeArticle({ text: articleText, title, abstractive: useAbstractive });
      setResult(data);
      setHistory((items) => [
        {
          id: Date.now(),
          title: title || data.headline_suggestions?.[0] || 'Untitled article',
          category: data.category,
          sentiment: data.sentiment.label,
          text: articleText,
        },
        ...items,
      ].slice(0, 8));
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Check that the backend is running.');
    } finally {
      setLoading('');
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading('upload');
    setError('');
    try {
      const data = await uploadArticle(file);
      setTitle(file.name.replace(/\.[^.]+$/, ''));
      setArticleText(data.text);
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

  async function handleLatestNews() {
    setLoading('latest');
    setError('');
    try {
      const data = await fetchLatestNews(newsQuery);
      setLatestNews(data.articles || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not fetch latest news.');
    } finally {
      setLoading('');
    }
  }

  async function handleAsk() {
    if (!question.trim() || !articleText.trim()) return;
    setLoading('ask');
    setError('');
    try {
      setAnswer(await askQuestion({ text: articleText, question }));
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
  }

  function exportPdf() {
    window.print();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={21} /></div>
          <div>
            <p className="eyebrow">NLP workspace</p>
            <h1>News Intelligence Studio</h1>
            <span className="live-status"><i /> Local AI pipeline ready</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="primary-button" onClick={handleAnalyze} disabled={loading === 'analyze'}>
            {loading === 'analyze' ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
            Analyze
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="workspace">
        <section className="input-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Input</p>
              <h2>Article Source</h2>
            </div>
            <label className="file-button" title="Upload TXT, PDF, or DOCX">
              {loading === 'upload' ? <Loader2 className="spin" size={17} /> : <Upload size={17} />}
              Upload
              <input type="file" accept=".txt,.pdf,.docx" onChange={handleUpload} />
            </label>
          </div>

          <input
            className="title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Article title"
          />

          <textarea
            value={articleText}
            onChange={(event) => setArticleText(event.target.value)}
            placeholder="Paste article text here..."
          />

          <div className="source-grid">
            <div className="inline-control">
              <Globe2 size={17} />
              <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Enter news URL" />
              <button onClick={handleFetchUrl} disabled={loading === 'url'} title="Fetch URL">
                {loading === 'url' ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
              </button>
            </div>
            <div className="inline-control">
              <FileText size={17} />
              <input value={newsQuery} onChange={(event) => setNewsQuery(event.target.value)} placeholder="NewsAPI query" />
              <button onClick={handleLatestNews} disabled={loading === 'latest'} title="Fetch latest news">
                {loading === 'latest' ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>

          <label className="model-toggle" title="Requires ENABLE_TRANSFORMERS=true in the backend environment">
            <input
              type="checkbox"
              checked={useAbstractive}
              onChange={(event) => setUseAbstractive(event.target.checked)}
            />
            Generate optional transformer summary
          </label>

          {latestNews.length > 0 && (
            <div className="latest-list">
              {latestNews.slice(0, 4).map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  onClick={() => {
                    setTitle(item.title || 'Latest news');
                    setArticleText([item.title, item.description, item.content].filter(Boolean).join('\n\n'));
                  }}
                >
                  <span>{item.title}</span>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="results-panel">
          {!result ? (
            <EmptyState />
          ) : (
            <>
              <div className="metric-strip">
                <Metric icon={<BarChart3 size={18} />} label="Words" value={result.statistics.word_count} />
                <Metric icon={<Activity size={18} />} label="Category" value={result.category} />
                <Metric icon={<FileText size={18} />} label="Read" value={result.reading_time.original} />
                <Metric icon={<Bot size={18} />} label="Entities" value={entityCount} />
              </div>

              <div className="summary-toolbar">
                <div className="tabs">
                  {['short', 'medium', 'detailed', 'extractive_textrank', 'extractive_lexrank', ...(result.summaries.abstractive ? ['abstractive'] : [])].map((tab) => (
                    <button
                      key={tab}
                      className={summaryTab === tab ? 'active' : ''}
                      onClick={() => setSummaryTab(tab)}
                    >
                      {tab.replace('extractive_', '').replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="summary-actions">
                  <button className="icon-button" onClick={speakSummary} title="Text to speech">
                    <Volume2 size={17} />
                  </button>
                  <button className="icon-button" onClick={exportPdf} title="Export as PDF">
                    <Download size={17} />
                  </button>
                </div>
              </div>

              <article className="summary-box">
                <h2>{result.title || result.headline_suggestions[0]}</h2>
                <p>{result.summaries[summaryTab]}</p>
              </article>

              <div className="dashboard-grid">
                <SentimentCard sentiment={result.sentiment} />
                <KeywordCard title="Keywords" items={result.keywords} />
                <KeywordCard title="Important Phrases" items={result.key_phrases} />
                <EntityCard entities={result.entities} />
                <StatsCard stats={result.statistics} fakeNews={result.fake_news_probability} />
                <WordCloud words={result.word_cloud} />
              </div>

              <section className="qa-panel">
                <div className="panel-header compact">
                  <div>
                    <p className="eyebrow">Question Answering</p>
                    <h2>Ask the article</h2>
                  </div>
                </div>
                <div className="qa-row">
                  <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." />
                  <button className="primary-button" onClick={handleAsk} disabled={loading === 'ask'}>
                    {loading === 'ask' ? <Loader2 className="spin" size={17} /> : <Send size={17} />}
                    Ask
                  </button>
                </div>
                {answer && (
                  <div className="answer-box">
                    <strong>{answer.answer}</strong>
                    <span>Confidence {answer.confidence}%</span>
                    {answer.evidence?.map((line) => <p key={line}>{line}</p>)}
                  </div>
                )}
              </section>
            </>
          )}
        </section>

        <aside className="history-panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Saved</p>
              <h2>History</h2>
            </div>
            <History size={18} />
          </div>
          {history.length === 0 ? (
            <p className="muted">Analyzed articles are saved locally in this browser.</p>
          ) : (
            history.map((item) => (
              <button
                className="history-item"
                key={item.id}
                onClick={() => {
                  setTitle(item.title);
                  setArticleText(item.text);
                }}
              >
                <strong>{item.title}</strong>
                <span>{item.category} · {item.sentiment}</span>
              </button>
            ))
          )}
        </aside>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-orbit"><Sparkles size={32} /></div>
      <p className="eyebrow">Ready when you are</p>
      <h2>Analyze a news article to generate summaries, sentiment, entities, keywords, QA evidence, and dashboard statistics.</h2>
      <p>Paste a story, upload a document, or pull a topic from live news to begin.</p>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SentimentCard({ sentiment }) {
  return (
    <section className="data-card">
      <h3>Sentiment</h3>
      <strong className="large-label">{sentiment.label}</strong>
      {Object.entries(sentiment.scores).map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div><i style={{ width: `${value}%` }} /></div>
          <b>{value}%</b>
        </div>
      ))}
    </section>
  );
}

function KeywordCard({ title, items }) {
  return (
    <section className="data-card">
      <h3>{title}</h3>
      <div className="tag-list">
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function EntityCard({ entities }) {
  return (
    <section className="data-card wide">
      <h3>Named Entities</h3>
      <div className="entity-grid">
        {Object.entries(entities).length === 0 && <p className="muted">No entities detected.</p>}
        {Object.entries(entities).map(([label, values]) => (
          <div key={label}>
            <strong>{label}</strong>
            <p>{values.join(', ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsCard({ stats, fakeNews }) {
  return (
    <section className="data-card">
      <h3>Statistics</h3>
      <dl className="stats-list">
        <div><dt>Sentences</dt><dd>{stats.sentence_count}</dd></div>
        <div><dt>Compression</dt><dd>{stats.compression_ratio}%</dd></div>
        <div><dt>Summary words</dt><dd>{stats.summary_word_count}</dd></div>
        <div><dt>Fake news risk</dt><dd>{fakeNews.probability}%</dd></div>
      </dl>
      <p className="muted">{fakeNews.label}</p>
    </section>
  );
}

function WordCloud({ words }) {
  const max = Math.max(...words.map((word) => word.value), 1);
  return (
    <section className="data-card">
      <h3>Word Cloud</h3>
      <div className="word-cloud">
        {words.slice(0, 22).map((word) => (
          <span key={word.text} style={{ fontSize: `${0.85 + (word.value / max) * 1.1}rem` }}>
            {word.text}
          </span>
        ))}
      </div>
    </section>
  );
}

export default App;
