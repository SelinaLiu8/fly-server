import React, { useEffect } from 'react';

const BugReportScreen = () => {
  useEffect(() => {
    // Load the JotForm script
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize the form handler after the script is loaded
    script.onload = () => {
      if (window.jotformEmbedHandler) {
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-250567387390163']", "https://form.jotform.com/");
      }
    };

    return () => {
      // Clean up the script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="screen screen-bug-report">
      <h1>Bug Report</h1>
      <div className="bug-report-container">
        <iframe
          id="JotFormIFrame-250567387390163"
          title="Bug Tracker"
          onLoad={() => window.parent.scrollTo(0, 0)}
          allowTransparency="true"
          allow="geolocation; microphone; camera; fullscreen"
          src="https://form.jotform.com/250567387390163"
          frameBorder="0"
          style={{ minWidth: '100%', maxWidth: '100%', height: '539px', border: 'none' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};

export default BugReportScreen;
