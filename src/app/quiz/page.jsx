"use client";
import { useState, useEffect } from 'react';
import { setValueToDatabase } from '@/app/miscFunctions/actions';
import { useAuth, useRTDB } from '@/hooks/firebaseHooks';
import { Spinner } from 'react-bootstrap';
import { FiEdit3, FiTrash2, FiPlusCircle, FiAward, FiRotateCcw, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function QuizPage() {
    // Database & State Management
    const [quizzes, setQuizzes] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Playable Quiz States
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answered, setAnswered] = useState(false);

    // Form / Admin States
    const [form, setForm] = useState({ type: 'math', question: '', a: '', b: '', c: '', answer: '' });
    const [editingId, setEditingId] = useState(null);

    const { user, loading, error } = useAuth();
    const { data, loading: dataLoading, error: dataError } = useRTDB(`quizzes`);

    useEffect(() => {
        import('bootstrap/dist/js/bootstrap.bundle.min.js');
    }, []);

    // Fetch and flatten quiz data
    useEffect(() => {
        if (data) {
            const allQuizzes = Object.keys(data).flatMap(categoryName => {
                const categoryData = data[categoryName];
                return Object.keys(categoryData).map(quizId => {
                    const { type, ...restOfData } = categoryData[quizId];
                    return {
                        id: quizId,
                        category: categoryName,
                        ...restOfData
                    };
                });
            });
            setQuizzes(allQuizzes.reverse());
        } else {
            setQuizzes([]);
        }
    }, [data]);

    // Filter quizzes by chosen category
    const filteredQuizzes = selectedCategory === 'all'
        ? quizzes
        : quizzes.filter(q => q.category === selectedCategory);

    const currentQuestion = filteredQuizzes[activeQuestionIndex];

    // Quiz Play Logic
    const handleOptionSelect = (optionValue) => {
        if (answered) return;
        setSelectedOption(optionValue);
        setAnswered(true);

        if (optionValue === currentQuestion.answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (activeQuestionIndex + 1 < filteredQuizzes.length) {
            setActiveQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const restartQuiz = () => {
        setActiveQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowResults(false);
        setAnswered(false);
    };

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setActiveQuestionIndex(0);
        setSelectedOption(null);
        setScore(0);
        setShowResults(false);
        setAnswered(false);
    };

    // Form Handling (Unchanged DB logic)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.answer) return alert("Please select the correct answer!");

        const { type, ...rest } = form;
        const id = editingId || `q_${Date.now()}`;
        const reference = `quizzes/${type}/${id}`;

        try {
            await setValueToDatabase(reference, rest);
            alert(editingId ? "Question Updated!" : "Question Saved!");
            setForm({ type: 'math', question: '', a: '', b: '', c: '', answer: '' });
            setEditingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (quiz) => {
        setForm({
            type: quiz.category,
            question: quiz.question,
            a: quiz.a,
            b: quiz.b,
            c: quiz.c,
            answer: quiz.answer
        });
        setEditingId(quiz.id);
    };

    const handleDelete = async (q) => {
        if (confirm("Are you sure you want to delete this question?")) {
            const reference = `quizzes/${q.category}/${q.id}`;
            await setValueToDatabase(reference, null);
        }
    };

    if (dataLoading) {
        return (
            <div className='min-vh-100 bg-light d-flex justify-content-center align-items-center'>
                <div className="text-center">
                    <Spinner animation="border" variant="warning" style={{ width: '4rem', height: '4rem' }} />
                    <h3 className="mt-3 text-muted fw-bold">Loading your Quiz Adventure... 🚀</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-warning-subtle py-4" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Trebuchet MS", sans-serif' }}>
            <div className="container" style={{ maxWidth: '800px' }}>

                {/* TOP BAR / HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
                    <h2 className="fw-black text-primary m-0">🎈 Kids Quiz Fun!</h2>
                    <button
                        className="btn btn-outline-dark rounded-pill fw-bold"
                        data-bs-toggle="modal"
                        data-bs-target="#adminModal"
                    >
                        <FiPlusCircle className="me-1" /> Manage Questions
                    </button>
                </div>

                {/* CATEGORY SELECTOR BADGES */}
                <div className="d-flex gap-2 justify-content-center mb-4 flex-wrap">
                    {['all', 'math', 'spelling', 'gk'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`btn rounded-pill px-4 fw-bold text-uppercase ${selectedCategory === cat
                                ? 'btn-primary shadow scale-up'
                                : 'btn-white text-dark shadow-sm'
                                }`}
                        >
                            {cat === 'gk' ? 'General Knowledge' : cat}
                        </button>
                    ))}
                </div>

                {/* PLAYABLE QUIZ CONTAINER */}
                {filteredQuizzes.length === 0 ? (
                    <div className="card border-0 shadow-lg rounded-5 text-center p-5 bg-white">
                        <h3 className="text-muted mb-3">No questions found in this category yet! 🎈</h3>
                        <p className="text-secondary">Click "Manage Questions" to add some fun questions.</p>
                    </div>
                ) : showResults ? (
                    /* SCORE / RESULTS CARD */
                    <div className="card border-0 shadow-lg rounded-5 text-center p-5 bg-white">
                        <div className="display-1 text-warning mb-3">
                            <FiAward />
                        </div>
                        <h1 className="fw-bold mb-2">Awesome Job! 🎉</h1>
                        <p className="fs-4 text-muted">
                            You scored <strong className="text-success">{score}</strong> out of <strong>{filteredQuizzes.length}</strong>!
                        </p>
                        <div className="mt-4">
                            <button className="btn btn-success btn-lg rounded-pill px-5 fw-bold shadow" onClick={restartQuiz}>
                                <FiRotateCcw className="me-2" /> Play Again
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ACTIVE QUESTION CARD */
                    <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">

                        {/* Progress Bar */}
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="badge bg-info text-dark rounded-pill px-3 fs-6">
                                Question {activeQuestionIndex + 1} of {filteredQuizzes.length}
                            </span>
                            <span className="badge bg-secondary rounded-pill px-3 fs-6 text-uppercase">
                                {currentQuestion.category}
                            </span>
                        </div>
                        <div className="progress mb-4" style={{ height: '12px' }}>
                            <div
                                className="progress-bar bg-warning progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: `${((activeQuestionIndex + 1) / filteredQuizzes.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question Text */}
                        <h3 className="fw-bold text-dark mb-4 text-center">
                            {currentQuestion.question}
                        </h3>

                        {/* Options Grid */}
                        <div className="row g-3">
                            {['a', 'b', 'c'].map((optKey) => {
                                const optionValue = currentQuestion[optKey];
                                const isSelected = selectedOption === optionValue;
                                const isCorrect = optionValue === currentQuestion.answer;

                                let btnVariant = "btn-outline-primary";
                                if (answered) {
                                    if (isCorrect) btnVariant = "btn-success";
                                    else if (isSelected) btnVariant = "btn-danger";
                                    else btnVariant = "btn-light opacity-50";
                                }

                                return (
                                    <div className="col-12" key={optKey}>
                                        <button
                                            disabled={answered}
                                            onClick={() => handleOptionSelect(optionValue)}
                                            className={`btn ${btnVariant} btn-lg w-100 p-3 rounded-4 text-start d-flex justify-content-between align-items-center fw-bold fs-5 shadow-sm`}
                                        >
                                            <span>{optionValue}</span>
                                            {answered && isCorrect && <FiCheckCircle className="fs-3" />}
                                            {answered && isSelected && !isCorrect && <FiXCircle className="fs-3" />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Footer */}
                        {answered && (
                            <div className="mt-4 text-end">
                                <button className="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow" onClick={handleNextQuestion}>
                                    {activeQuestionIndex + 1 === filteredQuizzes.length ? 'See Results! 🏆' : 'Next Question ➡️'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BOOTSTRAP MODAL FOR CREATING / EDITING / MANAGING QUIZZES */}
            <div className="modal fade" id="adminModal" tabIndex="-1" aria-labelledby="adminModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content rounded-4 border-0">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title fw-bold" id="adminModalLabel">
                                {editingId ? "📝 Edit Question" : "➕ Add New Question"}
                            </h5>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">

                            {/* FORM SECTION */}
                            <form onSubmit={handleSubmit} className="mb-5 bg-light p-3 rounded-3 border">
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label fw-bold">Type</label>
                                        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                            <option value="math">Math</option>
                                            <option value="spelling">Spelling</option>
                                            <option value="gk">General Knowledge</option>
                                        </select>
                                    </div>
                                    <div className="col-md-8 mb-3">
                                        <label className="form-label fw-bold">Question</label>
                                        <input className="form-control" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="row g-2 mb-3">
                                    {['a', 'b', 'c'].map(opt => (
                                        <div className="col-4" key={opt}>
                                            <input className="form-control" placeholder={`Option ${opt.toUpperCase()}`} value={form[opt]} onChange={(e) => setForm({ ...form, [opt]: e.target.value })} required />
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-3">
                                    <select className="form-select border-success" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required>
                                        <option value="">-- Select Correct Answer --</option>
                                        {form.a && <option value={form.a}>{form.a}</option>}
                                        {form.b && <option value={form.b}>{form.b}</option>}
                                        {form.c && <option value={form.c}>{form.c}</option>}
                                    </select>
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className={`btn flex-grow-1 fw-bold ${editingId ? 'btn-success' : 'btn-primary'}`}>
                                        {editingId ? "Update Question" : "Save Question"}
                                    </button>
                                    {editingId && (
                                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm({ type: 'math', question: '', a: '', b: '', c: '', answer: '' }); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* QUESTION BANK TABLE */}
                            <h5 className="fw-bold mb-3">Question Bank ({quizzes.length})</h5>
                            <div className="table-responsive rounded-3 border">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Type</th>
                                            <th>Question</th>
                                            <th>Answer</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizzes.map((q) => (
                                            <tr key={q.id}>
                                                <td><span className="badge bg-info text-dark">{q.category}</span></td>
                                                <td className="fw-bold">{q.question}</td>
                                                <td className="text-success fw-bold">{q.answer}</td>
                                                <td className="text-center">
                                                    <div className="btn-group">
                                                        <button onClick={() => handleEdit(q)} className="btn btn-sm btn-outline-primary">
                                                            <FiEdit3 />
                                                        </button>
                                                        <button onClick={() => handleDelete(q)} className="btn btn-sm btn-outline-danger">
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}