import { ArrowRight, ShieldCheck, Sparkles, Activity, Database, BellRing, Layers, Radar, LineChart, Monitor } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import "./LandingPage.css"

const capabilities = [
    {
        title: "Historical Analytics",
        description: "Analyze market behavior across long horizons with clean, queryable history.",
        icon: Radar,
    },
    {
        title: "OHLCV Visualization",
        description: "Inspect candlesticks, volume, and indicators with precise chart controls.",
        icon: LineChart,
    },
    {
        title: "Watchlist Monitoring",
        description: "Track key symbols in real time and act on anomalies faster.",
        icon: Activity,
    },
    {
        title: "Alert System",
        description: "Trigger rule-based alerts for price, volume, or signal thresholds.",
        icon: BellRing,
    },
    {
        title: "Data Warehouse",
        description: "Structured storage for validated market data and research outputs.",
        icon: Database,
    },
    {
        title: "ETL & Validation",
        description: "Pipeline monitoring with integrity checks and lineage context.",
        icon: Layers,
    },
    {
        title: "Market Dashboards",
        description: "Role-based overview screens with KPIs, queues, and market health.",
        icon: Monitor,
    },
    {
        title: "AI Vision Layer",
        description: "Planned forecasting modules for signals, scoring, and strategy notes.",
        icon: Sparkles,
    },
]

const workflow = [
    {
        title: "Collect",
        description: "Ingest multi-source feeds into a normalized and auditable pipeline.",
    },
    {
        title: "Validate",
        description: "Apply rule checks, anomaly filters, and structural completeness.",
    },
    {
        title: "Analyze",
        description: "Surface insights, generate comparisons, and monitor the market pulse.",
    },
]

export default function LandingPage() {
    return (
        <div className="landing-root">
            <div className="landing-ambient" />

            <header className="landing-nav">
                <div className="landing-brand">
                    <div className="landing-logo">AI</div>
                    <span>AI Stock Trend</span>
                </div>
                <nav className="landing-links">
                    <a href="#capabilities">Capabilities</a>
                    <a href="#architecture">Architecture</a>
                    <a href="#dashboard">Dashboard</a>
                    <a href="#ai-vision">AI Vision</a>
                </nav>
                <div className="landing-actions">
                    <Button asChild size="sm" variant="ghost" className="landing-ghost">
                        <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild size="sm" className="landing-primary">
                        <Link to="/login">
                            Get Started
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="landing-main">
                <section className="landing-hero">
                    <div className="landing-hero-copy">
                        <div className="landing-chip">Market data intelligence for fast teams</div>
                        <h1>
                            Stock Market Data
                            <br />
                            Visualization Platform Built for
                            <br />
                            Reliable Analytics
                        </h1>
                        <p>
                            Real-time and historical analytics, OHLCV visualization, and
                            comprehensive market trend monitoring designed for precision.
                            Terminal-grade performance for serious traders.
                        </p>
                        <div className="landing-cta">
                            <Button asChild size="lg" className="landing-primary">
                                <Link to="/login">Start Analyzing</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="landing-outline">
                                <Link to="/dashboard">View Platform</Link>
                            </Button>
                        </div>
                        <div className="landing-meta">
                            <div>
                                <ShieldCheck className="size-4" />
                                Trusted operational workflows
                            </div>
                            <div>
                                <Sparkles className="size-4" />
                                AI-ready signal pipeline
                            </div>
                        </div>
                    </div>

                    <div className="landing-terminal" aria-hidden="true">
                        <div className="landing-terminal-top">
                            <div className="landing-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="landing-terminal-title">ASTOCK_TERMINAL</span>
                            <span className="landing-terminal-status">LIVE</span>
                        </div>
                        <div className="landing-terminal-body">
                            <div className="landing-kpi">
                                <div>
                                    <span>VNINDEX</span>
                                    <strong>--</strong>
                                </div>
                                <div>
                                    <span>VN30</span>
                                    <strong>--</strong>
                                </div>
                                <div>
                                    <span>Total Volume</span>
                                    <strong>--</strong>
                                </div>
                            </div>
                            <div className="landing-chart">
                                <div className="landing-chart-grid" />
                                <div className="landing-chart-line" />
                                <div className="landing-chart-bars">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <span key={index} style={{ height: `${20 + index * 4}%` }} />
                                    ))}
                                </div>
                                <div className="landing-chart-labels">
                                    <span>OHLCV</span>
                                    <span>SMA</span>
                                    <span>EMA</span>
                                </div>
                            </div>
                            <div className="landing-tickers">
                                <div>
                                    <span>Top Gainers</span>
                                    <strong>SSI</strong>
                                </div>
                                <div>
                                    <span>Momentum</span>
                                    <strong>VND</strong>
                                </div>
                                <div>
                                    <span>Volume</span>
                                    <strong>HCM</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="capabilities" className="landing-section">
                    <div className="landing-section-heading">
                        <h2>Platform Capabilities</h2>
                        <p>Built for analysts, traders, and operations teams running live markets.</p>
                    </div>
                    <div className="landing-capabilities">
                        {capabilities.map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div className="landing-card" style={{ animationDelay: `${index * 90}ms` }} key={item.title}>
                                    <div className="landing-card-icon">
                                        <Icon className="size-4" />
                                    </div>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section id="architecture" className="landing-section landing-split">
                    <div>
                        <h2>Operational Architecture</h2>
                        <p>
                            A high-integrity data pipeline with visibility from ingestion to decision.
                            Every layer is observable and aligned with compliance-grade controls.
                        </p>
                        <div className="landing-flow">
                            {workflow.map((step) => (
                                <div key={step.title} className="landing-flow-step">
                                    <strong>{step.title}</strong>
                                    <span>{step.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="landing-panel">
                        <div className="landing-panel-header">
                            <span>Pipeline Health</span>
                            <span className="landing-status">Stable</span>
                        </div>
                        <div className="landing-panel-body">
                            <div>
                                <span>Sources Monitored</span>
                                <strong>--</strong>
                            </div>
                            <div>
                                <span>Validation Jobs</span>
                                <strong>--</strong>
                            </div>
                            <div>
                                <span>ETL Queues</span>
                                <strong>--</strong>
                            </div>
                            <div>
                                <span>Signal Accuracy</span>
                                <strong>--</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="dashboard" className="landing-section landing-dashboard">
                    <div className="landing-section-heading">
                        <h2>Dashboard Views That Scale</h2>
                        <p>Switch between analyst, staff, and admin layouts without losing context.</p>
                    </div>
                    <div className="landing-dashboard-grid">
                        <div className="landing-dashboard-card">
                            <h3>Analyst View</h3>
                            <p>Signal scan, watchlists, and stock comparison focused workflows.</p>
                        </div>
                        <div className="landing-dashboard-card">
                            <h3>Staff View</h3>
                            <p>ETL monitoring, data validation queues, and ingestion coverage.</p>
                        </div>
                        <div className="landing-dashboard-card">
                            <h3>Admin View</h3>
                            <p>Role management, system logs, and platform governance metrics.</p>
                        </div>
                    </div>
                </section>

                <section id="ai-vision" className="landing-section landing-cta-panel">
                    <div>
                        <h2>AI Vision Layer</h2>
                        <p>
                            Extend your trading workflows with forecast signals, anomaly detection,
                            and research automation. The AI stack is designed to plug into the
                            validated data core.
                        </p>
                    </div>
                    <Button asChild size="lg" className="landing-primary">
                        <Link to="/register">Request Access</Link>
                    </Button>
                </section>
            </main>
        </div>
    )
}

