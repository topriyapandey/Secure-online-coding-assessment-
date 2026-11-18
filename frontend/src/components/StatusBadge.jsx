import React from 'react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();

  let badgeClass = 'badge-secondary';
  if (norm === 'accepted' || norm === 'passed' || norm === 'active' || norm === 'submitted') {
    badgeClass = 'badge-success';
  } else if (norm === 'wrong answer' || norm === 'wronganswer' || norm === 'compilation error' || norm === 'compilationerror' || norm === 'runtime error' || norm === 'runtimeerror' || norm === 'timed out' || norm === 'timedout') {
    badgeClass = 'badge-danger';
  } else if (norm === 'time limit exceeded' || norm === 'timelimitexceeded' || norm === 'in progress' || norm === 'inprogress' || norm === 'upcoming') {
    badgeClass = 'badge-warning';
  } else if (norm === 'ended' || norm === 'completed') {
    badgeClass = 'badge-info';
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
