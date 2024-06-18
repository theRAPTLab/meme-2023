/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

EvidenceNotes

Joshua whipped this up, so it might need some tightening.

The basic idea is to look for markdown style "Evidence links" in the comment
text and a) note it and b) make a link to it.

NOTE: The styling is off / we should be using VBadges but it was too much of a
hassle for me to figure out how.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import UR from '../../system/ursys';
import './EvidenceNotes.css'; // Import the CSS file for styling

class EvidenceNotes extends React.Component {
  handleEvidenceClick(evNumber, evLetter) {
    // Convert evNumber to a number
    const evNumberAsNumber = parseInt(evNumber, 10);

    // Check if evLetter is not null and convert it to a number
    const evLetterAsNumber = evLetter !== null ? evLetter.charCodeAt(0) - 96 : null;

    UR.Publish('SHOW_EVIDENCE_LINK', {
      evId: evLetterAsNumber,
      rsrcId: evNumberAsNumber
    });
  }

  render() {
    const { comment, isBeingEdited } = this.props || '';
    const evidencePattern = /Evidence (\d+)([a-z])?/gi;

    if (!comment || !comment.text) {
      return '';
    }

    const evidenceMatches = [...comment.text.matchAll(evidencePattern)];

    if (evidenceMatches && evidenceMatches.length > 0) {
      return (
        <div>
          Evidence:{' '}
          {evidenceMatches.map((match, index) => {
            const evNumber = match[1];
            const evLetter = match[2] || null; // Use null if the letter doesn't exist

            // Check if it's the last button to avoid adding comma and space
            const isLastButton = index === evidenceMatches.length - 1;

            return (
              <React.Fragment key={index}>
                <button
                  type="button" // Add the type attribute and set it to "button"
                  className="evidence-link" // Add the CSS class for hyperlink-like style
                  onClick={() => this.handleEvidenceClick(evNumber, evLetter)}
                >
                  {evNumber}
                  {evLetter}
                </button>
                {/* Add comma and space if it's not the last button */}
                {!isLastButton && ', '}
              </React.Fragment>
            );
          })}
        </div>
      );
    }
    return (
      <div hidden={!isBeingEdited}>
        Consider pointing out relevant evidence by typing 'evidence #'.
      </div>
    );
  }
}

export default EvidenceNotes;
