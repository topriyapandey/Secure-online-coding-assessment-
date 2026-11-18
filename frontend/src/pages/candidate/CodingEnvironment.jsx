import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { assessmentService } from '../../services/assessmentService';
import { codeService } from '../../services/codeService';
import { Timer } from '../../components/Timer';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Play, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Terminal, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  RotateCcw,
  Sparkles,
  Lock,
  Eye
} from 'lucide-react';

const BOILERPLATES = {
  python: `import sys

def solve():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write your solution here
    return 0;
}
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        // Write your solution here
    }
}
`,
  csharp: `using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        // Write your solution here
    }
}
`
};

export const CodingEnvironment = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [codes, setCodes] = useState({}); // questionId -> { language -> code }
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Execution & Output state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consoleTab, setConsoleTab] = useState('output'); // 'output' or 'submission'
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [draftSavedText, setDraftSavedText] = useState('All changes saved');

  // Load Attempt details
  useEffect(() => {
    assessmentService.getAttempt(attemptId)
      .then((data) => {
        setAttempt(data);
        if (data.status !== 'InProgress') {
          // If already submitted or timed out, direct to results
          navigate(`/candidate/results/${attemptId}`);
          return;
        }

        // Initialize code drafts from backend if present
        const initialCodes = {};
        if (data.drafts && data.drafts.length > 0) {
          data.drafts.forEach((d) => {
            if (!initialCodes[d.questionId]) initialCodes[d.questionId] = {};
            initialCodes[d.questionId][d.language] = d.code;
          });
        }
        setCodes(initialCodes);
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to load assessment attempt.');
        navigate('/candidate/assessments');
      })
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  const currentQuestion = attempt?.questions?.[activeQuestionIndex];

  // Current code in Monaco
  const currentCode = (currentQuestion && codes[currentQuestion.id]?.[selectedLanguage]) 
    ?? BOILERPLATES[selectedLanguage] 
    ?? '';

  const handleCodeChange = (newCode) => {
    if (!currentQuestion) return;
    setCodes((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        [selectedLanguage]: newCode || ''
      }
    }));
    setDraftSavedText('Unsaved edits...');
  };

  // Periodic autosave draft every 15 seconds
  useEffect(() => {
    if (!currentQuestion || !currentCode) return;

    const timer = setTimeout(async () => {
      try {
        await codeService.saveDraft(
          attemptId,
          currentQuestion.id,
          selectedLanguage,
          currentCode
        );
        setDraftSavedText('Draft autosaved');
      } catch (e) {
        // Silent fail for autosave
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentCode, selectedLanguage, currentQuestion, attemptId]);

  // Handle Run Code (against sample test cases or custom input)
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setRunning(true);
    setConsoleTab('output');
    setRunResult(null);

    try {
      const result = await codeService.runCode(
        currentQuestion.id,
        currentCode,
        selectedLanguage,
        useCustomInput ? customInput : null
      );
      setRunResult(result);
    } catch (err) {
      setRunResult({
        status: 'Error',
        errorMessage: err.response?.data?.message || 'Failed to run code on Judge0 server.'
      });
    } finally {
      setRunning(false);
    }
  };

  // Handle Submit Solution (against all hidden test cases)
  const handleSubmitSolution = async () => {
    if (!currentQuestion) return;
    setSubmitting(true);
    setConsoleTab('submission');
    setSubmissionResult(null);

    try {
      const result = await codeService.submitSolution(
        attemptId,
        currentQuestion.id,
        currentCode,
        selectedLanguage
      );
      setSubmissionResult(result);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit solution.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Finalize whole assessment attempt
  const handleFinalizeAssessment = async () => {
    if (window.confirm('Are you sure you want to finish and submit the assessment? You will not be able to change your solutions after this.')) {
      try {
        await assessmentService.submitAttempt(attemptId);
        navigate(`/candidate/results/${attemptId}`);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to finalize assessment.');
      }
    }
  };

  // Auto-submit when countdown hits zero
  const handleTimeExpire = async () => {
    alert('Time has expired! Submitting your assessment now...');
    try {
      await assessmentService.submitAttempt(attemptId);
    } catch (e) {
      // Ignored
    }
    navigate(`/candidate/results/${attemptId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff' }}>
        <p>Initializing coding environment and Judge0 runner...</p>
      </div>
    );
  }

  if (!attempt || !currentQuestion) {
    return <div className="page-content">Assessment not found.</div>;
  }

  return (
    <div className="coding-container">
      {/* Top Header */}
      <header className="coding-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
            {attempt.assessmentTitle}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {attempt.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQuestionIndex(idx);
                  setRunResult(null);
                  setSubmissionResult(null);
                }}
                className={`btn btn-sm ${idx === activeQuestionIndex ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '3px 10px', fontSize: '0.78rem' }}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Server-backed Timer */}
          <Timer
            initialSeconds={attempt.remainingSeconds}
            onExpire={handleTimeExpire}
          />

          <button
            onClick={handleFinalizeAssessment}
            className="btn btn-danger btn-sm"
            style={{ fontWeight: 600 }}
          >
            Finish & Submit Test
          </button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="coding-workspace">
        {/* Left Side: Problem Statement & Test Cases */}
        <div className="problem-panel">
          <div className="problem-tabs">
            <button className="tab-btn active">
              Problem Description
            </button>
          </div>

          <div className="problem-content">
            <h2 className="problem-title">
              {activeQuestionIndex + 1}. {currentQuestion.title}
            </h2>

            <div className="problem-meta">
              <span className={`badge ${
                currentQuestion.difficulty === 'Easy' ? 'badge-success' : currentQuestion.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb' }}>
                {currentQuestion.marks} Marks
              </span>
            </div>

            <div style={{ color: '#1e293b', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {currentQuestion.problemDescription}
            </div>

            {currentQuestion.inputFormat && (
              <>
                <div className="section-title">Input Format</div>
                <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                  {currentQuestion.inputFormat}
                </div>
              </>
            )}

            {currentQuestion.outputFormat && (
              <>
                <div className="section-title">Output Format</div>
                <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                  {currentQuestion.outputFormat}
                </div>
              </>
            )}

            {currentQuestion.constraints && (
              <>
                <div className="section-title">Constraints</div>
                <div style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                  {currentQuestion.constraints}
                </div>
              </>
            )}

            {/* Sample Test Cases */}
            <div className="section-title">Sample Test Case</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Input:</div>
            <div className="code-block">{currentQuestion.sampleInput || '(No input required)'}</div>

            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Expected Output:</div>
            <div className="code-block">{currentQuestion.sampleExpectedOutput}</div>

            {/* Custom Input Toggle */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                />
                <span>Test with custom input</span>
              </label>

              {useCustomInput && (
                <textarea
                  className="form-textarea"
                  rows="3"
                  style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input stdin here..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Monaco Editor & Bottom Console */}
        <div className="editor-panel">
          {/* Editor Toolbar */}
          <div className="editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                className="form-select"
                style={{
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: '1px solid #475569',
                  padding: '5px 10px',
                  fontSize: '0.85rem',
                  width: '140px'
                }}
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="python">Python 3</option>
                <option value="csharp">C# (.NET)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java (OpenJDK)</option>
              </select>

              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {draftSavedText}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRunCode}
                className="btn btn-secondary btn-sm"
                disabled={running || submitting}
                style={{ backgroundColor: '#334155', color: '#fff', borderColor: '#475569' }}
              >
                <Play size={14} color="#38bdf8" />
                <span>{running ? 'Running...' : 'Run Code'}</span>
              </button>

              <button
                onClick={handleSubmitSolution}
                className="btn btn-primary btn-sm"
                disabled={running || submitting}
              >
                <Send size={14} />
                <span>{submitting ? 'Evaluating...' : 'Submit Solution'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="editor-main">
            <Editor
              height="100%"
              language={selectedLanguage === 'csharp' ? 'csharp' : selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
              theme="vs-dark"
              value={currentCode}
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Bottom Console Panel */}
          <div className="console-panel">
            <div className="console-header">
              <div style={{ display: 'flex', gap: '12px' }}>
                <span
                  onClick={() => setConsoleTab('output')}
                  style={{
                    cursor: 'pointer',
                    color: consoleTab === 'output' ? '#ffffff' : '#94a3b8',
                    borderBottom: consoleTab === 'output' ? '2px solid #38bdf8' : 'none',
                    paddingBottom: '2px'
                  }}
                >
                  Execution Console
                </span>
                <span
                  onClick={() => setConsoleTab('submission')}
                  style={{
                    cursor: 'pointer',
                    color: consoleTab === 'submission' ? '#ffffff' : '#94a3b8',
                    borderBottom: consoleTab === 'submission' ? '2px solid #38bdf8' : 'none',
                    paddingBottom: '2px'
                  }}
                >
                  Submission Evaluation
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Judge0 Isolated Sandbox
              </div>
            </div>

            <div className="console-body">
              {consoleTab === 'output' ? (
                runResult ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, color: runResult.passed ? '#4ade80' : '#f87171' }}>
                        Status: {runResult.status}
                      </span>
                      {runResult.executionTimeMs && (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          Time: {Math.round(runResult.executionTimeMs)} ms
                        </span>
                      )}
                      {runResult.memoryKb && (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          Memory: {Math.round(runResult.memoryKb)} KB
                        </span>
                      )}
                    </div>

                    {runResult.compileOutput && (
                      <div style={{ color: '#f87171', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                        <strong>Compilation Error:</strong>
                        <pre>{runResult.compileOutput}</pre>
                      </div>
                    )}

                    {runResult.errorMessage && (
                      <div style={{ color: '#f87171', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>
                        <strong>Error / Stderr:</strong>
                        <pre>{runResult.errorMessage}</pre>
                      </div>
                    )}

                    <div style={{ marginTop: '6px' }}>
                      <strong style={{ color: '#94a3b8' }}>Your Output (Stdout):</strong>
                      <pre style={{ color: '#f8fafc', background: '#020617', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                        {runResult.standardOutput || '(Empty output)'}
                      </pre>
                    </div>

                    {runResult.expectedOutput && (
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: '#94a3b8' }}>Sample Expected Output:</strong>
                        <pre style={{ color: '#cbd5e1', background: '#020617', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                          {runResult.expectedOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#64748b' }}>
                    Click "Run Code" to execute your program against the visible sample test cases.
                  </p>
                )
              ) : (
                submissionResult ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: submissionResult.status === 'Accepted' ? '#4ade80' : '#f87171'
                        }}>
                          {submissionResult.status}
                        </span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                          Passed {submissionResult.passedTestCases} of {submissionResult.totalTestCases} test cases
                        </span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
                        Score: {submissionResult.marksObtained} / {submissionResult.maxMarks} marks
                      </div>
                    </div>

                    {/* Breakdown of each test case */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {submissionResult.testCaseResults.map((tc) => (
                        <div
                          key={tc.testCaseNumber}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            background: tc.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${tc.passed ? '#22c55e' : '#ef4444'}`,
                            fontSize: '0.8rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                            <span style={{ color: tc.passed ? '#4ade80' : '#f87171' }}>
                              Case {tc.testCaseNumber} ({tc.isHidden ? 'Hidden' : 'Sample'})
                            </span>
                            <span style={{ color: tc.passed ? '#4ade80' : '#f87171' }}>
                              {tc.status}
                            </span>
                          </div>
                          {tc.executionTime && (
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                              Time: {Math.round(tc.executionTime)} ms
                            </div>
                          )}
                          {!tc.isHidden && !tc.passed && tc.actualOutput && (
                            <div style={{ marginTop: '4px', color: '#fca5a5' }}>
                              Output: {tc.actualOutput}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#64748b' }}>
                    Click "Submit Solution" to grade this question against all hidden test cases.
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
