import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("Cloud Budget could not render", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-cream-100 p-6">
        <section className="premium-card w-full max-w-lg rounded-3xl p-7 text-center">
          <p className="eyebrow">Local data is still in this browser</p>
          <h1 className="mt-2 font-display text-3xl">Cloud hit a display problem.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Reload the app to try again. Avoid clearing browser data; your local budget has not been intentionally removed.</p>
          <button onClick={() => window.location.reload()} className="interactive-button mt-6 min-h-11 rounded-xl bg-forest-900 px-5 text-sm font-bold text-white hover:bg-forest-800">Reload Cloud</button>
        </section>
      </main>
    );
  }
}
