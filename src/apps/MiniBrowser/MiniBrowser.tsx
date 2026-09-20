import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ExternalLink,
  Home,
  Search,
  Globe,
  BookOpen,
  Map,
  Code2,
  Youtube,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppProps } from "../../types";
import "./MiniBrowser.css";

const START = "webos://start";

type SearchEngine = {
  name: string;
  url: string;
  icon: string;
};

const SEARCH_ENGINES: SearchEngine[] = [
  {
    name: "Google (Default)",
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/favicon.ico",
  },
  {
    name: "Google",
    url: "https://www.google.com/search?q=",
    icon: "https://www.google.com/favicon.ico",
  },
  {
    name: "Microsoft Bing",
    url: "https://www.bing.com/search?q=",
    icon: "https://www.bing.com/favicon.ico",
  },
  {
    name: "Yahoo! India",
    url: "https://search.yahoo.com/search?p=",
    icon: "https://search.yahoo.com/favicon.ico",
  },
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    icon: "https://duckduckgo.com/favicon.ico",
  },
  {
    name: "Yandex",
    url: "https://yandex.com/search/?text=",
    icon: "https://yandex.com/favicon.ico",
  },
];

const SPEED_DIAL: {
  label: string;
  url: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Wikipedia",
    url: "https://www.wikipedia.org",
    icon: BookOpen,
  },
  {
    label: "OpenStreetMap",
    url: "https://www.openstreetmap.org",
    icon: Map,
  },
  {
    label: "MDN",
    url: "https://developer.mozilla.org",
    icon: Code2,
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com",
    icon: Youtube,
  },
  {
    label: "Reddit",
    url: "https://www.reddit.com",
    icon: MessageCircle,
  },
  {
    label: "News",
    url: "https://en.wikipedia.org/wiki/Portal:Current_events",
    icon: Newspaper,
  },
];

function isUrl(value: string): boolean {
  if (/^https?:\/\//i.test(value)) return true;

  return /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(value);
}

function normalizeUrl(raw: string, engine: SearchEngine): string {
  const value = raw.trim();

  if (!value) return START;

  if (value === START) return START;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (isUrl(value)) {
    return "https://" + value;
  }

  return engine.url + encodeURIComponent(value);
}

export function MiniBrowser({}: AppProps) {
  const [history, setHistory] = useState<string[]>([START]);
  const [index, setIndex] = useState(0);

  const [inputUrl, setInputUrl] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [engine, setEngine] = useState<SearchEngine>(
    SEARCH_ENGINES[0]
  );

  const [showEngines, setShowEngines] = useState(false);

  const [now, setNow] = useState(new Date());

  const url = history[index];
  const onStartPage = url === START;

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  function navigate(raw: string) {
    const next = normalizeUrl(raw, engine);

    if (next === START) {
      setHistory([START]);
      setIndex(0);
      setInputUrl("");
      return;
    }

    const newHistory = history.slice(0, index + 1);
    newHistory.push(next);

    setHistory(newHistory);
    setIndex(newHistory.length - 1);
    setInputUrl(next);
    setLoading(true);
  }

  function goBack() {
    if (index <= 0) return;

    const nextIndex = index - 1;

    setIndex(nextIndex);

    const target = history[nextIndex];

    setInputUrl(target === START ? "" : target);
    setLoading(target !== START);
  }

  function goForward() {
    if (index >= history.length - 1) return;

    const nextIndex = index + 1;

    setIndex(nextIndex);

    const target = history[nextIndex];

    setInputUrl(target === START ? "" : target);
    setLoading(target !== START);
  }

  function reload() {
    if (onStartPage) return;

    setLoading(true);
    setReloadKey((value) => value + 1);
  }

  function goHome() {
    navigate(START);
  }

  function submitSearch() {
    if (!inputUrl.trim()) return;

    navigate(inputUrl);
  }

  return (
    <div className="browser">

      {/* Browser toolbar */}
      <div className="browser__bar">

        <button
          className="browser__btn"
          disabled={index <= 0}
          onClick={goBack}
          title="Back"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          className="browser__btn"
          disabled={index >= history.length - 1}
          onClick={goForward}
          title="Forward"
        >
          <ChevronRight size={17} />
        </button>

        <button
          className="browser__btn"
          onClick={reload}
          disabled={onStartPage}
          title="Reload"
        >
          <RotateCw
            size={15}
            className={loading ? "browser__spin" : undefined}
          />
        </button>

        <button
          className="browser__btn"
          onClick={goHome}
          title="Home"
        >
          <Home size={15} />
        </button>

        {/* Search engine selector */}
        <div className="browser__engine">
          <button
            className="browser__engine-button"
            onClick={() => setShowEngines(!showEngines)}
            title="Search engine"
          >
            <img
              src={engine.icon}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <span>⌄</span>
          </button>

          {showEngines && (
            <div className="browser__engine-menu">
              {SEARCH_ENGINES.map((item) => (
                <button
                  key={item.name}
                  className="browser__engine-item"
                  onClick={() => {
                    setEngine(item);
                    setShowEngines(false);
                  }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Address/search field */}
        <div className="browser__address">

          <Globe size={15} />

          <input
            className="browser__url"
            value={inputUrl}
            placeholder="Search the web or enter a URL"
            onChange={(event) =>
              setInputUrl(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitSearch();
              }
            }}
            spellCheck={false}
          />

          <button
            className="browser__address-search"
            onClick={submitSearch}
            title="Search"
          >
            <Search size={15} />
          </button>

        </div>

        <button
          className="browser__btn"
          onClick={() => window.open(url, "_blank")}
          disabled={onStartPage}
          title="Open in new tab"
        >
          <ExternalLink size={15} />
        </button>

      </div>

      {loading && !onStartPage && (
        <div className="browser__progress" />
      )}

      {/* Start page */}
      {onStartPage ? (

        <div className="browser__start">

          <div className="browser__date">
            {now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="browser__start-clock">
            {now.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>

          <div className="browser__start-title">
            Search the web
          </div>

          <div className="browser__search">

            <img
              src={engine.icon}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <input
              placeholder="Search the web or enter a URL"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(
                    (event.target as HTMLInputElement).value
                  );
                }
              }}
              autoFocus
              spellCheck={false}
            />

            <button
              onClick={() => {
                const input =
                  document.querySelector(
                    ".browser__search input"
                  ) as HTMLInputElement | null;

                if (input) navigate(input.value);
              }}
            >
              <Search size={18} />
            </button>

          </div>

          <div className="browser__dial">

            {SPEED_DIAL.map((site) => (
              <button
                key={site.url}
                className="browser__tile"
                onClick={() => navigate(site.url)}
              >
                <site.icon size={23} />
                <span>{site.label}</span>
              </button>
            ))}

          </div>

          <div className="browser__start-note">
            <strong>{engine.name}</strong> is selected for web
            searches. Enter a website address to navigate directly.
          </div>

        </div>

      ) : (

        <iframe
          key={`${index}-${reloadKey}`}
          className="browser__frame"
          src={url}
          title="WebOS Browser"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setLoading(false)}
        />

      )}

    </div>
  );
}
