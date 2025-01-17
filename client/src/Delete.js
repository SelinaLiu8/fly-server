// Import any necessary libraries or dependencies
import React from 'react';

// Base URL for API calls (customize this as needed)
const urlBase = 'http://142.93.118.6';

// Main delete function
export function runDelete({ isoForms, geneName, onComplete }) {
  // Log operation details
  console.log("Delete operation initiated.");
  console.log("Gene Name:", geneName);
  console.log("IsoForms:", isoForms);

  // Prepare API endpoint
  const deleteApiUrl = `${urlBase}/api/?type=delete`;

  // Notify calling component that the operation is starting
  onComplete &&
    onComplete({
      loading: true,
      message: (
        <div className="popup-loading">
          <h2>Deleting IsoForms...</h2>
          <p>Please wait while the deletion is in progress.</p>
        </div>
      ),
    });

  // Prepare the request payload
  const payload = {
    geneName,
    isoforms: isoForms,
  };

  // Make the API request
  fetch(deleteApiUrl, {
    method: 'POST', // HTTP method for delete (can be adjusted as needed)
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload), // Pass the payload as JSON
  })
    .then((response) => response.json())
    .then((result) => handleSuccess(result, onComplete))
    .catch((error) => handleError(error, onComplete));
}

// Handle success responses
function handleSuccess(result, onComplete) {
  console.log("Delete API Response:", result);

  if (result.success) {
    // Notify calling component of success
    onComplete &&
      onComplete({
        success: true,
        message: (
          <div className="popup-success">
            <h2>Deletion Successful</h2>
            <p>The selected isoforms have been successfully deleted.</p>
          </div>
        ),
      });
  } else {
    // Notify calling component of a failure
    handleError(result.error || "Unknown error occurred.", onComplete);
  }
}

// Handle errors
function handleError(error, onComplete) {
  console.error("Error during delete operation:", error);

  // Notify calling component of the error
  onComplete &&
    onComplete({
      success: false,
      message: (
        <div className="popup-error">
          <h2>Deletion Failed</h2>
          <p>
            {typeof error === 'string'
              ? error
              : "An error occurred during deletion. Please try again later."}
          </p>
        </div>
      ),
    });
}
