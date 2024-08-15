import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
const ImageIcon = <FontAwesomeIcon icon={faImage} />;
const DescriptionIcon = <FontAwesomeIcon icon={faFileLines} />;
const IdeaIcon = <FontAwesomeIcon icon={faLightbulb} />;
const ContactSupportIcon = <FontAwesomeIcon icon={faCircleQuestion} />;

const RESOURCE_TYPES = {
  simulation: ImageIcon,
  assumption: IdeaIcon,
  idea: IdeaIcon,
  report: DescriptionIcon,
  question: ContactSupportIcon,
  other: DescriptionIcon
};

const EVResourceTypeIcon = ({ type }) => {
  return RESOURCE_TYPES[type] ? RESOURCE_TYPES[type] : RESOURCE_TYPES.other;
};

export default EVResourceTypeIcon;
