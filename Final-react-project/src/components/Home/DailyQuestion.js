import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DailyQuestion.css';

export default function DailyQuestion({ userInfo }) {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);

  const userId = userInfo?._id;

  useEffect(() => {
    if (userId) {
      fetchQuestion();
    }
  }, [userId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      const res = await axios.get(`http://localhost:5000/api/quiz/daily-question/${userId}`);
      const q = res.data;
      setQuestion(q);

      const answerRes = await axios.get(`http://localhost:5000/api/quiz/answer-status/${userId}/${q._id}`);
      const { alreadyAnswered, isCorrect, selectedAnswerIndex } = answerRes.data;

      if (alreadyAnswered) {
        setAlreadyAnswered(true);
        setFeedback(isCorrect ? "✅ Correct answer!" : "❌ Wrong answer");
        setSelectedAnswer(selectedAnswerIndex); 
      } else {
        setAlreadyAnswered(false);
        setSelectedAnswer(null);
      }

    } catch (error) {
      console.error('Failed to fetch question or answer status:', error);
      setFeedback(error.response?.data?.message || 'No new question available');
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {

    if (selectedAnswer === null || !question) return;

    try {
      const res = await axios.post('http://localhost:5000/api/quiz/answer', {
        userId,
        questionId: question._id,
        selectedAnswerIndex: selectedAnswer,
      });

      if (res.data.isCorrect) {
        setFeedback('✅ Correct answer!');
      } else {
        setFeedback('❌ Wrong answer');
      }

      setAlreadyAnswered(true);
    } catch (error) {
      console.error('❌ Failed to submit answer:', error);
      setFeedback('Error submitting the answer');
    }
  };

  if (loading) return <p>Loading question...</p>;
  if (!question) return <p>{feedback || 'No question found'}</p>;

  return (
    <div className="daily-question-box">
      <h2>Daily Question</h2>
      <p className="question-text">{question.questionText}</p>
      <ul className="answer-options">
        {question.options.map((option, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                name="answer"
                value={index}
                checked={selectedAnswer === index}
                onChange={() => setSelectedAnswer(index)}
                disabled={alreadyAnswered}
              />
              {option}
            </label>
          </li>
        ))}
      </ul>
      <button 
        onClick={handleSubmitAnswer}
        disabled={selectedAnswer === null || alreadyAnswered}
      >
        Submit Answer
      </button>
      {feedback && <p className="feedback">{feedback}</p>}
    </div>
  );
}
